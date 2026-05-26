import { type CharacterKey } from "@/entities/character/types";

type InventoryMessageSet = {
  stageBubble: {
    base: string;
    equipped: (skinName: string) => string;
  };
  equipSuccess: {
    base: string;
    equipped: (skinName: string) => string;
  };
  baseSkinDescription: string;
  skinMeta: {
    equipped: string;
    unequipped: string;
  };
  emptyInventory: {
    title: string;
    description: string;
  };
};

// 보관함은 캐릭터가 직접 말을 건네는 화면이라, 같은 상태 안내도 별친구별 말투로 분리한다.
const inventoryMessages: Record<CharacterKey, InventoryMessageSet> = {
  mumu: {
    stageBubble: {
      base: "무... 무무! (해석: 지금은 기본 외형으로 있어요.)",
      equipped: (skinName) => `무무... 무! (해석: ${skinName}을 입고 있어요.)`,
    },
    equipSuccess: {
      base: "무... 무! (해석: 기본 외형으로 돌아왔어요.)",
      equipped: (skinName) => `무무! 무우... (해석: ${skinName} 장착 완료!)`,
    },
    baseSkinDescription: "무... 무무. (해석: 스킨을 해제하고 원래 모습으로 돌아가요.)",
    skinMeta: {
      equipped: "무무...! (해석: 지금 별친구가 입고 있어요.)",
      unequipped: "무? 무무! (해석: 선택하면 바로 장착돼요.)",
    },
    emptyInventory: {
      title: "무... 무무. (해석: 아직 아이템이 없어요.)",
      description: "무우... 무! (해석: 상점에서 마음에 드는 스킨을 먼저 골라봐요.)",
    },
  },
  nova: {
    stageBubble: {
      base: "지금은 원래의 빛으로 머무르고 있어요.",
      equipped: (skinName) => `${skinName}의 빛을 두르고 있어요.`,
    },
    equipSuccess: {
      base: "원래의 빛으로 다시 돌아왔어요.",
      equipped: (skinName) => `${skinName}의 궤도로 갈아입었어요.`,
    },
    baseSkinDescription: "스킨을 잠시 내려두고 원래의 빛으로 돌아가요.",
    skinMeta: {
      equipped: "지금 별친구가 이 빛을 두르고 있어요.",
      unequipped: "선택하면 바로 새로운 빛으로 바뀌어요.",
    },
    emptyInventory: {
      title: "아직 보관한 스킨이 없어요.",
      description: "상점에서 별친구에게 어울리는 빛을 찾아봐요.",
    },
  },
  jjori: {
    stageBubble: {
      base: "지금은 기본 외형. 깔끔하지?",
      equipped: (skinName) => `${skinName} 장착 중. 꽤 어울리는데?`,
    },
    equipSuccess: {
      base: "기본 외형 복귀 완료!",
      equipped: (skinName) => `${skinName} 장착 완료. 바로 출동 가능!`,
    },
    baseSkinDescription: "스킨 해제하고 원래 모습으로 바로 복귀!",
    skinMeta: {
      equipped: "지금 별친구가 입고 있음. 확인 끝!",
      unequipped: "누르면 바로 장착. 망설일 틈 없음!",
    },
    emptyInventory: {
      title: "아직 보유 스킨 없음!",
      description: "상점에서 하나 골라오면 바로 입혀볼 수 있어.",
    },
  },
};

export function getInventoryStageBubble(
  characterKey: CharacterKey,
  equippedSkinName: string | null | undefined,
) {
  const messages = inventoryMessages[characterKey];

  return equippedSkinName
    ? messages.stageBubble.equipped(equippedSkinName)
    : messages.stageBubble.base;
}

export function getInventoryEquipSuccessMessage(
  characterKey: CharacterKey,
  itemName: string | null,
) {
  const messages = inventoryMessages[characterKey];

  return itemName
    ? messages.equipSuccess.equipped(itemName)
    : messages.equipSuccess.base;
}

export function getInventoryBaseSkinDescription(characterKey: CharacterKey) {
  return inventoryMessages[characterKey].baseSkinDescription;
}

export function getInventorySkinMeta(characterKey: CharacterKey, equipped: boolean) {
  const messages = inventoryMessages[characterKey].skinMeta;

  return equipped ? messages.equipped : messages.unequipped;
}

export function getInventoryEmptyState(characterKey: CharacterKey) {
  return inventoryMessages[characterKey].emptyInventory;
}
