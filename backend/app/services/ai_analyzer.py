"""
AI-powered resume analysis using the OpenAI SDK against OpenRouter.
"""

import json
import logging
import re
from typing import Any, Optional

import httpx
from openai import AsyncOpenAI

from backend.app.config import settings
from backend.app.models.schemas import ResumeInfo, MatchResult

logger = logging.getLogger(__name__)

# ── OpenAI-compatible async client (pointed at OpenRouter) ───────────────────
#
# The HTTP transport is shared, but the OpenAI client itself is built per
# request so that an API key supplied by the frontend can be honored. When no
# key is provided we fall back to the server-side default from settings.

_http_client = httpx.AsyncClient(
    trust_env=False,
    timeout=60.0,
)


def _build_client(api_key: Optional[str] = None) -> AsyncOpenAI:
    """Return an AsyncOpenAI client using *api_key* or the configured default."""
    key = (api_key or "").strip() or settings.AI_API_KEY
    return AsyncOpenAI(
        api_key=key,
        base_url=settings.AI_BASE_URL,
        http_client=_http_client,
    )


# ── JSON extraction helper ──────────────────────────────────────────────────

def _extract_json(text: str) -> dict[str, Any]:
    """
    Best-effort extraction of a JSON object from an LLM response that may
    contain markdown fences, leading prose, etc.
    """
    # 1. Try the raw text first
    try:
        return json.loads(text)
    except json.JSONDecodeError:
        pass

    # 2. Look for a ```json ... ``` block
    m = re.search(r"```(?:json)?\s*\n?(.*?)```", text, re.DOTALL)
    if m:
        try:
            return json.loads(m.group(1).strip())
        except json.JSONDecodeError:
            pass

    # 3. Find the first { … } substring (greedy)
    m = re.search(r"\{.*\}", text, re.DOTALL)
    if m:
        try:
            return json.loads(m.group(0))
        except json.JSONDecodeError:
            pass

    raise ValueError(f"Could not extract valid JSON from AI response:\n{text[:500]}")


# ── Prompts ──────────────────────────────────────────────────────────────────

_EXTRACT_SYSTEM = """\
你是一个专业的简历解析助手。用户会给你一份简历的纯文本内容，请你从中提取结构化信息，
并严格按照下面的 JSON Schema 返回（不要添加任何多余文字）。

要求：
- 所有字段如果简历中没有，就填 null 或空列表。
- skills 是一个字符串列表，包含简历中提到的所有技能/工具/编程语言。
- summary 是你对整份简历的一段概括性描述（100-200字）。

返回格式（严格 JSON）：
{
  "basic_info": {
    "name": "姓名",
    "phone": "手机号",
    "email": "邮箱",
    "address": "地址"
  },
  "job_intent": {
    "desired_position": "期望职位",
    "expected_salary": "期望薪资",
    "available_date": "到岗时间"
  },
  "education": [
    {
      "school": "学校名",
      "degree": "学历/学位",
      "major": "专业",
      "gpa": "GPA/绩点",
      "start_date": "开始时间",
      "end_date": "结束时间"
    }
  ],
  "work_experience": [
    {
      "company": "公司名",
      "position": "职位",
      "start_date": "开始时间",
      "end_date": "结束时间",
      "description": "工作描述"
    }
  ],
  "project_experience": [
    {
      "name": "项目名称",
      "role": "担任角色",
      "description": "项目描述",
      "tech_stack": ["技术栈"]
    }
  ],
  "skills": ["技能1", "技能2"],
  "summary": "简历概括"
}
"""

_MATCH_SYSTEM = """\
你是一个专业的HR招聘助手。用户会给你一份简历文本和一段岗位描述（JD），
请你从以下维度对简历与岗位的匹配度进行评分和分析，并严格按照 JSON 格式返回。

评分维度（每个 0-100 分）：
1. 技能匹配度 (skills_match) — 简历中的技能与JD要求的技能吻合程度
2. 工作经验相关性 (experience_relevance) — 过往工作经历与目标岗位的相关性
3. 学历匹配度 (education_match) — 学历、专业是否满足要求
4. 项目经验相关性 (project_relevance) — 项目经历与岗位需求的契合度
5. 综合匹配度 (overall_fit) — 综合评估候选人与岗位的适配程度

返回格式（严格 JSON）：
{
  "overall_score": 75,
  "dimensions": [
    {"name": "技能匹配度", "score": 80, "comment": "具体评价"},
    {"name": "工作经验相关性", "score": 70, "comment": "具体评价"},
    {"name": "学历匹配度", "score": 85, "comment": "具体评价"},
    {"name": "项目经验相关性", "score": 65, "comment": "具体评价"},
    {"name": "综合匹配度", "score": 75, "comment": "具体评价"}
  ],
  "summary": "整体匹配情况的简要总结",
  "strengths": ["优势1", "优势2"],
  "weaknesses": ["不足1", "不足2"],
  "suggestions": ["建议1", "建议2"]
}
"""


# ── Public API ───────────────────────────────────────────────────────────────

async def extract_resume_info(text: str, api_key: Optional[str] = None) -> ResumeInfo:
    """Call the LLM to extract structured information from resume text."""
    logger.info("Requesting AI resume extraction (%d chars)", len(text))

    client = _build_client(api_key)
    response = await client.chat.completions.create(
        model=settings.AI_MODEL,
        messages=[
            {"role": "system", "content": _EXTRACT_SYSTEM},
            {"role": "user", "content": f"以下是简历内容：\n\n{text}"},
        ],
        temperature=0.1,
        max_tokens=4096,
    )

    raw = response.choices[0].message.content or ""
    logger.debug("AI extraction raw response length: %d", len(raw))

    try:
        data = _extract_json(raw)
        return ResumeInfo.model_validate(data)
    except Exception as exc:
        logger.error("Failed to parse extraction response: %s", exc)
        raise ValueError(f"AI returned unparseable response: {exc}") from exc


async def match_resume(
    resume_text: str,
    job_description: str,
    api_key: Optional[str] = None,
) -> MatchResult:
    """Score how well *resume_text* matches *job_description*."""
    logger.info(
        "Requesting AI match (resume=%d chars, JD=%d chars)",
        len(resume_text),
        len(job_description),
    )

    user_msg = (
        f"## 简历内容\n\n{resume_text}\n\n"
        f"## 岗位描述（JD）\n\n{job_description}"
    )

    client = _build_client(api_key)
    response = await client.chat.completions.create(
        model=settings.AI_MODEL,
        messages=[
            {"role": "system", "content": _MATCH_SYSTEM},
            {"role": "user", "content": user_msg},
        ],
        temperature=0.1,
        max_tokens=4096,
    )

    raw = response.choices[0].message.content or ""
    logger.debug("AI match raw response length: %d", len(raw))

    try:
        data = _extract_json(raw)
        return MatchResult.model_validate(data)
    except Exception as exc:
        logger.error("Failed to parse match response: %s", exc)
        raise ValueError(f"AI returned unparseable response: {exc}") from exc
