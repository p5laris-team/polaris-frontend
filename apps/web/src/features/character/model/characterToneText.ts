/**
 * 캐릭터별 화면 대사 형식을 보정하는 유틸입니다.
 * 프론트에서 말투를 새로 만들지 않고, 내려온 문장과 캐릭터 이름만 최소 보정합니다.
 */
import { type CharacterKey } from "@/entities/character/types";
import { type CharacterInteractionResponse } from "@/features/character/model/characterTalkTypes";

export function formatCharacterSpeech(
  characterKey: CharacterKey,
  text: string | null | undefined,
  characterName?: string | null,
) {
  const normalized = text?.trim() ?? "";
  if (!normalized) return "";

  if (characterKey !== "mumu") {
    return normalized;
  }

  return applyMumuCharacterName(normalized, characterName);
}

export function formatCharacterInteractionText(result: CharacterInteractionResponse, characterName?: string | null) {
  const message = result.message?.trim() ?? "";
  const interpretation = result.interpretation?.trim() ?? "";

  if (result.characterTypeCode === "MUMU" || result.characterTypeCode === "mumu") {
    return formatMumuInteractionText(message, interpretation, characterName);
  }

  return interpretation || message;
}

function formatMumuInteractionText(
  message: string,
  interpretation: string,
  characterName?: string | null,
) {
  const normalizedMessage = applyMumuCharacterName(message, characterName);
  const normalizedInterpretation = applyMumuCharacterName(interpretation, characterName);

  if (!normalizedMessage) {
    return normalizedInterpretation;
  }

  if (!normalizedInterpretation || normalizedMessage.includes("(해석:")) {
    return normalizedMessage;
  }

  return `${normalizedMessage} (해석: ${normalizedInterpretation})`;
}

function applyMumuCharacterName(text: string, characterName?: string | null) {
  const name = characterName?.trim();
  if (!text || !name) {
    return text;
  }

  return text
    .replace(/무무가/g, `${name}${subjectParticle(name)}`)
    .replace(/무무는/g, `${name}${topicParticle(name)}`)
    .replace(/무무도/g, `${name}도`)
    .replace(/무무에게/g, `${name}에게`)
    .replace(/무무와/g, `${name}${companionParticle(name)}`)
    .replace(/무무의/g, `${name}의`);
}

function subjectParticle(value: string) {
  return hasFinalConsonant(value) ? "이" : "가";
}

function topicParticle(value: string) {
  return hasFinalConsonant(value) ? "은" : "는";
}

function companionParticle(value: string) {
  return hasFinalConsonant(value) ? "과" : "와";
}

function hasFinalConsonant(value: string) {
  if (!value) {
    return false;
  }

  const codePoint = value.codePointAt(value.length - 1) ?? 0;
  return codePoint >= 0xac00 && codePoint <= 0xd7a3 && (codePoint - 0xac00) % 28 !== 0;
}
