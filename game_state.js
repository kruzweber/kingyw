(function () {
  const STORAGE_KEY = "fishingKingYoungwooState";

  const defaultState = {
    gold: 0,
    fame: 0,
    loadout: {
      freshwater: "toyRod",
      sea: "noneSea",
      vehicle: "tivoli",
      boat: "noneBoat",
      outfit: "beginnerOutfit"
    },
    activeField: "fresh",
    inventory: {
      freshwater: ["noneFreshwater", "toyRod"],
      sea: ["noneSea"],
      vehicle: ["noneVehicle", "tivoli"],
      boat: ["noneBoat"],
      outfit: ["beginnerOutfit"]
    },
    flags: {
      intro_complete: true
    },
    caughtFish: [],
    junk: [],
    achievements: [],
    endings: [],
    titles: {
      owned: [],
      equipped: ""
    },
    titleNotices: [],
    pendingEvents: [],
    seenEvents: [],
    stats: {
      lifetimeGoldEarned: 0,
      lifetimeFameEarned: 0
    }
  };

  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  function mergeDefaults(state) {
    const next = clone(defaultState);
    const source = state || {};
    next.gold = Number(source.gold ?? next.gold);
    next.fame = Number(source.fame ?? next.fame);
    next.loadout = { ...next.loadout, ...(source.loadout || {}) };
    next.activeField = source.activeField || next.activeField;
    next.flags = { ...next.flags, ...(source.flags || {}) };
    next.caughtFish = Array.isArray(source.caughtFish) ? source.caughtFish : [];
    next.junk = Array.isArray(source.junk) ? source.junk : [];
    next.achievements = Array.isArray(source.achievements) ? source.achievements : [];
    next.endings = Array.isArray(source.endings) ? source.endings : [];
    next.titles = {
      owned: Array.isArray(source.titles?.owned) ? source.titles.owned : [],
      equipped: typeof source.titles?.equipped === "string" ? source.titles.equipped : ""
    };
    next.titleNotices = Array.isArray(source.titleNotices) ? source.titleNotices : [];
    next.pendingEvents = Array.isArray(source.pendingEvents) ? source.pendingEvents : [];
    next.seenEvents = Array.isArray(source.seenEvents) ? source.seenEvents : [];
    next.stats = {
      ...next.stats,
      ...(source.stats || {})
    };
    next.stats.lifetimeGoldEarned = Math.max(
      Number(next.stats.lifetimeGoldEarned || 0),
      Number(next.gold || 0)
    );
    next.stats.lifetimeFameEarned = Math.max(
      Number(next.stats.lifetimeFameEarned || 0),
      Number(next.fame || 0)
    );

    for (const key of Object.keys(next.inventory)) {
      const saved = source.inventory?.[key];
      next.inventory[key] = Array.isArray(saved) ? Array.from(new Set(saved)) : next.inventory[key];
    }

    return normalizeState(next);
  }

  function normalizeState(state) {
    const next = state || clone(defaultState);

    addItem(next, "freshwater", "noneFreshwater");
    addItem(next, "freshwater", "toyRod");
    addItem(next, "sea", "noneSea");
    addItem(next, "vehicle", "noneVehicle");
    addItem(next, "boat", "noneBoat");
    addItem(next, "outfit", "beginnerOutfit");

    if (next.flags.tivoli_confiscated && !next.flags.tivoli_returned) {
      removeItem(next, "vehicle", "tivoli");
      if (next.loadout.vehicle === "tivoli") next.loadout.vehicle = "noneVehicle";
    }

    if (next.flags.tivoli_returned) {
      addItem(next, "vehicle", "tivoli");
    }

    if (next.flags.g70_stolen && !next.flags.g70_key_found) {
      removeItem(next, "vehicle", "g70");
      if (next.loadout.vehicle === "g70") next.loadout.vehicle = "noneVehicle";
    }

    if (next.flags.g70_key_found) {
      addItem(next, "vehicle", "g70");
    }

    if (next.flags.carnival_owned && next.flags.first_leisure_broken) {
      next.flags.first_leisure_exchanged = true;
    }

    if (next.flags.first_leisure_broken && !next.flags.first_leisure_exchanged) {
      removeItem(next, "sea", "firstLeisure");
      if (next.loadout.sea === "firstLeisure") next.loadout.sea = "noneSea";
    }

    if (next.flags.jaemo_flipper_found && !next.flags.valley_boat_owned) next.flags.valley_boat_owned = true;
    if (next.flags.valley_boat_owned) addItem(next, "boat", "valleyBoat");
    if (next.flags.sea_boat_owned) addItem(next, "boat", "seaBoat");
    if (next.flags.carnival_owned) addItem(next, "vehicle", "carnival");
    if (next.flags.first_leisure_exchanged) {
      addItem(next, "sea", "firstLeisure");
      if (
        next.loadout.sea === "noneSea"
        && (!next.loadout.freshwater || next.loadout.freshwater === "noneFreshwater")
        && canEquipWithOutfit(next, "sea", "firstLeisure")
      ) {
        next.loadout.sea = "firstLeisure";
      }
    }
    if (next.flags.temu_rod_owned) addItem(next, "sea", "temuRod");

    next.titles.owned = Array.from(new Set(next.titles.owned)).filter((titleId) => Boolean(titleDefinitions[titleId]));
    if (!titleDefinitions[next.titles.equipped] || !next.titles.owned.includes(next.titles.equipped)) {
      next.titles.equipped = "";
    }

    for (const type of Object.keys(next.loadout)) {
      if (!hasItem(next, type, next.loadout[type])) {
        next.loadout[type] = type === "freshwater" ? "noneFreshwater" : type === "sea" ? "noneSea" : type === "vehicle" ? "noneVehicle" : type === "boat" ? "noneBoat" : "beginnerOutfit";
      }
    }

    for (const type of ["freshwater", "sea"]) {
      if (!canEquipWithOutfit(next, type, next.loadout[type])) {
        next.loadout[type] = matchingGearForOutfit(next, type);
      }
    }

    enforceSingleRodLoadout(next);

    next.caughtFish = Array.from(new Set(next.caughtFish));
    next.junk = Array.from(new Set(next.junk)).filter((name) => junkData.some((item) => item.name === name));
    const savedAchievements = Array.from(new Set(next.achievements));
    const savedEndings = Array.from(new Set(next.endings));
    next.achievements = Array.from(new Set([
      ...savedAchievements,
      ...savedEndings.filter((eventId) => achievementEventIds.includes(eventId))
    ])).filter((eventId) => Boolean(eventDefinitions[eventId]));
    next.endings = savedEndings.filter((eventId) => endingEventIds.includes(eventId));
    if (savedEndings.includes("true_ending_seen") && next.caughtFish.length >= 60 && !next.endings.includes("normal_ending_seen")) {
      next.endings.push("normal_ending_seen");
      next.flags.normal_ending_seen = true;
    }
    if (next.flags.true_ending_seen && !hasTrueEndingRequirements(next)) {
      delete next.flags.true_ending_seen;
      next.endings = next.endings.filter((eventId) => eventId !== "true_ending_seen");
      next.pendingEvents = next.pendingEvents.filter((eventId) => eventId !== "true_ending_seen");
    }
    next.pendingEvents = Array.from(new Set(next.pendingEvents)).filter((eventId) => Boolean(eventDefinitions[eventId]));
    next.seenEvents = Array.from(new Set(next.seenEvents)).filter((eventId) => Boolean(eventDefinitions[eventId]));
    next.titleNotices = Array.from(new Set(next.titleNotices)).filter((titleId) => Boolean(titleDefinitions[titleId]));
    grantAutomaticTitles(next);
    return next;
  }

  function load() {
    try {
      return mergeDefaults(JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"));
    } catch (error) {
      return clone(defaultState);
    }
  }

  function save(state) {
    const next = normalizeState(mergeDefaults(state));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    return next;
  }

  function reset() {
    localStorage.removeItem(STORAGE_KEY);
    return clone(defaultState);
  }

  function hasItem(state, type, itemId) {
    return Boolean(state.inventory?.[type]?.includes(itemId));
  }

  function addItem(state, type, itemId) {
    if (!state.inventory[type]) state.inventory[type] = [];
    if (!state.inventory[type].includes(itemId)) state.inventory[type].push(itemId);
    return state;
  }

  function removeItem(state, type, itemId) {
    if (!state.inventory[type]) return state;
    state.inventory[type] = state.inventory[type].filter((ownedId) => ownedId !== itemId);
    return state;
  }

  const titleDefinitions = {
    walker: {
      name: "뚜벅이",
      condition: "보유 차량 0대",
      bonusText: "유실물 확률 +8%, 골드 보상 -3%",
      bonus: { junkChance: 0.08, gold: -0.03 },
      notice: ["[칭호 획득] 뚜벅이", "도감의 칭호 탭에서 장착하거나 바꿀 수 있다.", "이번 칭호는 자동 장착됐다."]
    },
    gearManiac: {
      name: "장비병",
      condition: "장비 올수집",
      bonusText: "장비 안정성 +8%, 골드 보상 -5%",
      bonus: { stability: 0.08, gold: -0.05 },
      notice: ["[칭호 획득] 장비병", "도감의 칭호 탭에서 장착하거나 바꿀 수 있다.", "장비가 많아지니 이름도 무거워졌다."]
    },
    rich: {
      name: "부자",
      condition: "누적 수입 조건 달성",
      bonusText: "골드 보상 +12%, 명성 획득 -5%",
      bonus: { gold: 0.12, fame: -0.05 },
      notice: ["[칭호 획득] 부자", "도감의 칭호 탭에서 장착하거나 바꿀 수 있다.", "돈 냄새가 나지만 일단 향수라고 하자."]
    },
    youtuber: {
      name: "유투버",
      condition: "누적 명성 조건 달성",
      bonusText: "명성 획득 +20%, 희귀어 출현 +3%, 장비 안정성 -3%",
      bonus: { fame: 0.2, rareFish: 0.03, stability: -0.03 },
      notice: ["[칭호 획득] 유투버", "도감의 칭호 탭에서 장착하거나 바꿀 수 있다.", "구독과 좋아요보다 먼저 물고기부터 잡자."]
    },
    fishingKing: {
      name: "낚시왕",
      condition: "일반엔딩 달성",
      bonusText: "감기력 +5%, 희귀어 출현 +5%",
      bonus: { power: 0.05, rareFish: 0.05 },
      notice: ["[칭호 획득] 낚시왕", "도감의 칭호 탭에서 장착하거나 바꿀 수 있다.", "아들의 약속 앞에서 드디어 이름값을 했다."]
    }
  };

  function ensureTitleState(state) {
    if (!state.titles) state.titles = { owned: [], equipped: "" };
    if (!Array.isArray(state.titles.owned)) state.titles.owned = [];
    if (typeof state.titles.equipped !== "string") state.titles.equipped = "";
    if (!Array.isArray(state.titleNotices)) state.titleNotices = [];
  }

  function grantTitle(state, titleId, options = {}) {
    ensureTitleState(state);
    if (!titleDefinitions[titleId] || state.titles.owned.includes(titleId)) return false;
    state.titles.owned.push(titleId);
    if (options.autoEquip) state.titles.equipped = titleId;
    if (!state.titleNotices.includes(titleId)) state.titleNotices.push(titleId);
    return true;
  }

  function vehicleCount(state) {
    return ["tivoli", "g70", "carnival"].filter((itemId) => hasItem(state, "vehicle", itemId)).length;
  }

  function grantAutomaticTitles(state) {
    if (vehicleCount(state) === 0) grantTitle(state, "walker", { autoEquip: true });
    if (state.achievements?.includes("revenge_ending_seen")) grantTitle(state, "gearManiac");
    if (state.achievements?.includes("rich_ending_seen")) grantTitle(state, "rich");
    if (state.achievements?.includes("youtuber_ending_seen")) grantTitle(state, "youtuber");
    if (state.endings?.includes("normal_ending_seen") || state.flags?.normal_ending_seen) grantTitle(state, "fishingKing");
  }

  function equippedTitle(state) {
    ensureTitleState(state);
    return titleDefinitions[state.titles.equipped] || null;
  }

  function displayYoungwooName(state) {
    const title = equippedTitle(state);
    return title ? `${title.name} 남영우` : "남영우";
  }

  function titleBonus(state) {
    return equippedTitle(state)?.bonus || {};
  }

  function permanentBonus(state) {
    const ownedJunk = new Set(state?.junk || []);
    return {
      maxTension: ownedJunk.has("영우의 갯바위화") ? 50 : 0,
      powerFlat: ownedJunk.has("와이프의 카드영수증") ? 3 : 0
    };
  }

  function setEquippedTitle(state, titleId) {
    ensureTitleState(state);
    if (titleId && (!titleDefinitions[titleId] || !state.titles.owned.includes(titleId))) return save(state);
    state.titles.equipped = titleId || "";
    return save(state);
  }

  function consumeTitleNotices(state) {
    ensureTitleState(state);
    const notices = state.titleNotices
      .map((titleId) => ({ id: titleId, ...(titleDefinitions[titleId] || {}) }))
      .filter((title) => title.name);
    state.titleNotices = [];
    return { notices, state: save(state) };
  }

  function setLoadout(state, type, itemId) {
    if (!hasItem(state, type, itemId)) return state;
    if ((type === "freshwater" || type === "sea") && !canEquipWithOutfit(state, type, itemId)) return save(state);
    state.loadout[type] = itemId;
    if (type === "freshwater" && itemId !== "noneFreshwater") state.loadout.sea = "noneSea";
    if (type === "sea" && itemId !== "noneSea") state.loadout.freshwater = "noneFreshwater";
    return save(state);
  }

  function setFlag(state, flag) {
    state.flags[flag] = true;
    return save(state);
  }

  function clearFlag(state, flag) {
    delete state.flags[flag];
    return save(state);
  }

  const eventDefinitions = {
    tivoli_confiscated: {
      type: "컷씬",
      cutin: "압수!",
      portrait: "와",
      speaker: "와이프",
      lines: ["마트 가야 하니까 차 키 줘.", "영우는 바다보다 먼저 현실에 걸렸다."],
      afterLines: ["티볼리를 압수당했다.", "바다 장비까지 챙겼더니 집안 레이더에 걸렸다.", "민물에서 돈을 모아 G70을 준비하자."],
      car: "tivoli",
      actors: ["youngwoo", "wife"]
    },
    first_leisure_exchanged: {
      type: "이벤트",
      cutin: "교환!",
      portrait: "상",
      speaker: "상점 사장",
      lines: ["아이고, 카니발까지 뽑으신 고객님이셨군요!", "부러진 제1레져는 특별 서비스로!!", "새 제품 교환해드리겠습니다."],
      afterLines: ["상점 사장의 태도가 갑자기 공손해졌다.", "비싼 차를 사니 환불 불가 안내문도 목소리를 낮췄다.", "새 제1레져가 창고에 들어왔다."]
    },
    g70_stolen: {
      type: "문자",
      cutin: "먹튀",
      portrait: "준",
      speaker: "준우",
      lines: ["이 차, 완전 내 스타일이잖아.", "영우는 복수보다 먼저 교통수단을 잃었다."],
      afterLines: ["민물로 돌아가자. 수면 위에 수상한 물건이 떠다닌다.", "정체는 건져 올린 뒤에나 알 수 있다.", "지금은 민물에서 다시 길을 찾아보자."]
    },
    jaemo_flipper_found: {
      type: "컷씬",
      cutin: "오리발!",
      portrait: "재",
      speaker: "재모",
      lines: ["내 오리발을 찾아줬구나!", "오리발이 없으면 난 맥주병이야!"],
      afterLines: ["민물보트가 생겼다.", "이제 깊은 민물에서 제대로 돈을 모을 수 있다.", "카니발 자금을 모을 길이 열렸다."]
    },
    g70_key_dropped: {
      type: "컷씬",
      cutin: "풍덩",
      portrait: "준",
      speaker: "준우",
      lines: ["미안. 차키를 바다에 빠뜨렸어.", "차는 저기 바다 쪽에 주차해놨어.", "난 먼저 간다!"],
      afterLines: ["준우가 또 도망쳤다.", "멀리 G70이 보이고, 가까이에는 분노가 보인다.", "바다보트를 사서 백상아리 뱃속까지 확인하자."]
    },
    tivoli_returned: {
      type: "컷씬",
      cutin: "반환!",
      portrait: "와",
      speaker: "와이프",
      lines: ["방어? 이건 인정이지.", "티볼리 키는 다시 가져가."],
      afterLines: ["와이프가 방어를 좋아해서 티볼리를 돌려줬다.", "창고에 티볼리가 돌아왔다.", "영우의 어깨가 조금 올라갔다."]
    },
    g70_key_found: {
      type: "히든",
      cutin: "보조키!",
      portrait: "영",
      speaker: "낚시왕 남영우",
      lines: ["백상아리 배 속에서 G70 차키를 찾았다.", "영우 복수의 불씨가 살아났다."],
      afterLines: ["G70 차키를 찾았다.", "바다에 있던 G70이 창고로 돌아왔다.", "준우야, 보고 있냐."]
    },
    revenge_ending_seen: {
      type: "칭호",
      cutin: "장비병",
      portrait: "영",
      speaker: "낚시왕 남영우",
      lines: ["교환받은 제1레져까지 포함해 장비가 모두 창고에 모였다.", "영우는 장비병이라는 진단명을 담담히 받아들였다."],
      afterLines: ["칭호 '장비병'을 획득했다.", "창고가 곧 트로피룸이다.", "하지만 낚시는 계속된다."]
    },
    rich_ending_seen: {
      type: "칭호",
      cutin: "부자",
      portrait: "영",
      speaker: "낚시왕 남영우",
      lines: ["누적 수입 100,000G를 달성했다.", "영우는 통장을 보고 잠시 낚시를 잊었다."],
      afterLines: ["칭호 '부자'를 획득했다.", "돈은 많아졌지만 도감은 아직 남아 있다.", "게임은 계속된다."]
    },
    youtuber_ending_seen: {
      type: "칭호",
      cutin: "유투버",
      portrait: "영",
      speaker: "낚시왕 남영우",
      lines: ["누적 명성 20,000을 달성했다.", "영우는 낚시 유튜버로 떡상했다."],
      afterLines: ["칭호 '유투버'를 획득했다.", "구독자는 늘었지만 물고기는 더 남아 있다.", "게임은 계속된다."]
    },
    normal_ending_seen: {
      type: "엔딩",
      cutin: "약속 완료",
      portrait: "아",
      speaker: "아들",
      lines: ["아빠, 저 물고기들 이름 다 알아?", "영우는 도감 앞에서 괜히 목소리를 낮췄다.", "아빠는 다 잡아봐서 알지."],
      afterLines: ["일반엔딩을 확인했다.", "아들과의 약속은 지켰다.", "와이프는 환기를 지시했다."]
    },
    true_ending_seen: {
      type: "엔딩",
      cutin: "기념관 개장",
      portrait: "아",
      speaker: "아들",
      lines: ["아빠, 난 그냥 물고기만 보고 싶었는데...", "영우는 약속을 지키다 못해 박물관을 차렸다."],
      afterLines: ["진엔딩을 확인했다.", "유실물, 메인화면, 칭호까지 모두 모았다.", "남영우 낚시기념관은 오늘도 냄새가 난다."]
    }
  };

  const achievementEventIds = [
    "revenge_ending_seen",
    "rich_ending_seen",
    "youtuber_ending_seen"
  ];

  const endingEventIds = [
    "normal_ending_seen",
    "true_ending_seen"
  ];

  function queueEvent(state, eventId) {
    if (!eventDefinitions[eventId]) return state;
    if (!state.pendingEvents.includes(eventId) && !state.seenEvents.includes(eventId)) {
      state.pendingEvents.push(eventId);
    }
    return state;
  }

  function collectEnding(state, endingId) {
    if (!eventDefinitions[endingId]) return state;
    if (!state.endings.includes(endingId)) state.endings.push(endingId);
    queueEvent(state, endingId);
    return state;
  }

  function collectAchievement(state, achievementId) {
    if (!eventDefinitions[achievementId]) return state;
    if (!state.achievements.includes(achievementId)) state.achievements.push(achievementId);
    queueEvent(state, achievementId);
    return state;
  }

  function isEndingEvent(eventId) {
    return endingEventIds.includes(eventId);
  }

  function isAchievementEvent(eventId) {
    return achievementEventIds.includes(eventId);
  }

  function peekPendingEnding(state) {
    return state.pendingEvents?.find((eventId) => isEndingEvent(eventId)) || null;
  }

  function hasAllVehicles(state) {
    return ["tivoli", "g70", "carnival"].every((vehicleId) => hasItem(state, "vehicle", vehicleId));
  }

  function hasAllRevengeEquipment(state) {
    const required = {
      freshwater: ["toyRod", "aliRod", "japanRod"],
      sea: ["firstLeisure", "temuRod", "legendRod"],
      vehicle: ["tivoli", "g70", "carnival"],
      outfit: ["beginnerOutfit", "midOutfit", "premiumOutfit"],
      boat: ["valleyBoat", "seaBoat"]
    };
    return Boolean(state.flags.first_leisure_broken && state.flags.first_leisure_exchanged)
      && Object.entries(required).every(([type, itemIds]) => itemIds.every((itemId) => hasItem(state, type, itemId)));
  }

  function checkVehicleCollectionEnding(state) {
    if (hasAllRevengeEquipment(state)) collectAchievement(state, "revenge_ending_seen");
    return state;
  }

  function hasAllTitleScreens(state) {
    return Boolean(
      state.flags.intro_complete
      && state.flags.valley_boat_owned
      && state.flags.sea_boat_owned
    );
  }

  function hasAllJunk(state) {
    return junkData.every((item) => state.junk.includes(item.name));
  }

  function hasAllAchievements(state) {
    return achievementEventIds.every((eventId) => state.achievements.includes(eventId));
  }

  function hasAllAchievementTitles(state) {
    ensureTitleState(state);
    return Object.keys(titleDefinitions).every((titleId) => state.titles.owned.includes(titleId));
  }

  function hasTrueEndingRequirements(state) {
    return state.caughtFish.length >= fishData.length
      && hasAllJunk(state)
      && hasAllTitleScreens(state)
      && hasAllAchievements(state)
      && hasAllAchievementTitles(state);
  }

  function collectAvailableEndings(state) {
    if (hasAllRevengeEquipment(state)) {
      collectAchievement(state, "revenge_ending_seen");
      grantTitle(state, "gearManiac");
    }
    if ((state.stats?.lifetimeGoldEarned || state.gold || 0) >= 100000) {
      collectAchievement(state, "rich_ending_seen");
      grantTitle(state, "rich");
    }
    if ((state.stats?.lifetimeFameEarned || state.fame || 0) >= 20000) {
      collectAchievement(state, "youtuber_ending_seen");
      grantTitle(state, "youtuber");
    }
    if (state.caughtFish.length >= fishData.length) {
      state.flags.normal_ending_seen = true;
      collectEnding(state, "normal_ending_seen");
      grantTitle(state, "fishingKing");
    }
    if (hasTrueEndingRequirements(state)) {
      state.flags.true_ending_seen = true;
      collectEnding(state, "true_ending_seen");
    }
    return save(state);
  }

  function peekEvent(state) {
    return eventDefinitions[state.pendingEvents?.[0]] || null;
  }

  function consumeEvent(state, expectedEventId) {
    let eventId;
    if (expectedEventId && state.pendingEvents?.includes(expectedEventId)) {
      eventId = expectedEventId;
      state.pendingEvents = state.pendingEvents.filter((queuedId) => queuedId !== expectedEventId);
    } else {
      eventId = state.pendingEvents?.shift();
    }
    if (eventId && !state.seenEvents.includes(eventId)) state.seenEvents.push(eventId);
    return { eventId, event: eventDefinitions[eventId] || null, state: save(state) };
  }

  function triggerTivoliConfiscation(state) {
    if (state.flags.tivoli_confiscated || state.loadout.vehicle !== "tivoli") return { triggered: false, state: save(state) };
    state.flags.tivoli_confiscated = true;
    state.loadout.vehicle = "noneVehicle";
    removeItem(state, "vehicle", "tivoli");
    queueEvent(state, "tivoli_confiscated");
    return { triggered: "tivoli_confiscated", state: save(state) };
  }

  const fieldData = {
    fresh: {
      id: "fresh",
      name: "민물",
      gearType: "freshwater",
      fishGroup: "freshwaterBasic",
      junkGroup: "freshwater",
      minAccuracy: 35
    },
    valley: {
      id: "valley",
      name: "민물 보트",
      gearType: "freshwater",
      fishGroup: "freshwaterAdvanced",
      junkGroup: "freshwater",
      minAccuracy: 42
    },
    sea: {
      id: "sea",
      name: "바다",
      gearType: "sea",
      fishGroup: "seaNear",
      junkGroup: "sea",
      minAccuracy: 45
    },
    ocean: {
      id: "ocean",
      name: "바다 보트",
      gearType: "sea",
      fishGroup: "seaOcean",
      junkGroup: "sea",
      minAccuracy: 52
    }
  };

  const gearStats = {
    noneFreshwater: { name: "민물 장비 없음", accuracyBonus: -30, power: 0, stability: 0 },
    toyRod: { name: "아들의 장난감 낚시세트", accuracyBonus: -8, power: 8, stability: 5 },
    aliRod: { name: "알리산 낚시세트", accuracyBonus: 0, power: 17, stability: 14 },
    japanRod: { name: "명인의 낚시세트", accuracyBonus: 7, power: 30, stability: 25 },
    noneSea: { name: "바다 장비 없음", accuracyBonus: -30, power: 0, stability: 0 },
    firstLeisure: { name: "제1레져 낚시세트", accuracyBonus: 0, power: 19, stability: 7 },
    temuRod: { name: "테무산 낚시세트", accuracyBonus: 4, power: 28, stability: 18 },
    legendRod: { name: "전설의 낚시세트", accuracyBonus: 11, power: 50, stability: 38 }
  };

  const outfitLevels = {
    beginnerOutfit: 1,
    midOutfit: 2,
    premiumOutfit: 3
  };

  const gearLevels = {
    noneFreshwater: 0,
    noneSea: 0,
    toyRod: 1,
    firstLeisure: 1,
    aliRod: 2,
    temuRod: 2,
    japanRod: 3,
    legendRod: 3
  };

  function canEquipWithOutfit(state, type, itemId) {
    if (type !== "freshwater" && type !== "sea") return true;
    if (itemId === "noneFreshwater" || itemId === "noneSea") return true;
    const outfitLevel = outfitLevels[state.loadout?.outfit] || 1;
    return gearLevels[itemId] === outfitLevel;
  }

  function matchingGearForOutfit(state, type) {
    const fallback = type === "freshwater" ? "noneFreshwater" : "noneSea";
    const outfitLevel = outfitLevels[state.loadout?.outfit] || 1;
    const owned = state.inventory?.[type] || [];
    return owned
      .filter((itemId) => gearLevels[itemId] === outfitLevel)
      .sort((a, b) => gearLevels[b] - gearLevels[a])[0] || fallback;
  }

  function enforceSingleRodLoadout(state) {
    const hasFreshRod = state.loadout.freshwater && state.loadout.freshwater !== "noneFreshwater";
    const hasSeaRod = state.loadout.sea && state.loadout.sea !== "noneSea";
    if (!hasFreshRod || !hasSeaRod) return state;
    if (state.activeField === "sea" || state.activeField === "ocean") {
      state.loadout.freshwater = "noneFreshwater";
    } else {
      state.loadout.sea = "noneSea";
    }
    return state;
  }

  const outfitStats = {
    beginnerOutfit: {
      name: "입문 낚시복",
      image: "./assets/youngwoo_sprites/level_matched_alpha/youngwoo_beginner_toy_rod_idle.png",
      highLevelBonus: 0,
      lostItemBonus: 0,
      desc: "영우의 기본 낚시복. 시작은 초라하지만 약속은 진심이다."
    },
    midOutfit: {
      name: "중급 낚시복",
      image: "./assets/youngwoo_sprites/level_matched_alpha/youngwoo_mid_ali_rod_idle.png",
      highLevelBonus: 0.07,
      lostItemBonus: 0.08,
      desc: "방수 재킷과 조끼를 갖춘 실전형 낚시복. 희귀어 눈에 살짝 더 띈다."
    },
    premiumOutfit: {
      name: "고급 낚시복",
      image: "./assets/youngwoo_sprites/level_matched_alpha/youngwoo_premium_japan_rod_idle.png",
      highLevelBonus: 0.14,
      lostItemBonus: 0.16,
      desc: "돈 냄새가 나는 고급 낚시복. 큰놈들이 영우를 프로처럼 착각한다."
    }
  };

  const vehicleStats = {
    noneVehicle: { name: "없음", level: 0, goldBonus: 0 },
    tivoli: { name: "티볼리", level: 1, goldBonus: 0 },
    g70: { name: "G70", level: 2, goldBonus: 0.1 },
    carnival: { name: "카니발", level: 3, goldBonus: 0.2 }
  };

  const fishData = [
    { name: "피라미", field: "freshwaterBasic", level: 1, hp: 10, resistance: 1, gold: 80, weight: 24, desc: "시작은 미약했으나 영우의 손맛은 더 미약했다." },
    { name: "블루길", field: "freshwaterBasic", level: 1, hp: 15, resistance: 2, gold: 120, weight: 20, desc: "외래종이지만 영우보다 이 동네 적응력이 좋다." },
    { name: "빙어", field: "freshwaterBasic", level: 1, hp: 18, resistance: 2, gold: 140, weight: 18, desc: "작고 차갑다. 영우의 초반 자신감과 비슷하다." },
    { name: "붕어", field: "freshwaterBasic", level: 2, hp: 25, resistance: 3, gold: 160, weight: 18, desc: "영우는 붕어 앞에서도 긴장한다." },
    { name: "참붕어", field: "freshwaterBasic", level: 2, hp: 28, resistance: 4, gold: 200, weight: 15, desc: "참하게 생겼지만 입질은 전혀 참하지 않다." },
    { name: "끄리", field: "freshwaterBasic", level: 2, hp: 30, resistance: 4, gold: 240, weight: 14, desc: "물속에서는 빠르고, 영우의 손은 늦다." },
    { name: "꺾지", field: "freshwaterBasic", level: 2, hp: 35, resistance: 5, gold: 320, weight: 12, desc: "이름처럼 영우의 자신감도 꺾을 예정." },
    { name: "누치", field: "freshwaterBasic", level: 3, hp: 50, resistance: 6, gold: 400, weight: 9, desc: "강바닥의 오래된 주민. 월세는 안 낸다." },
    { name: "동자개", field: "freshwaterBasic", level: 3, hp: 55, resistance: 7, gold: 440, weight: 8, desc: "작은 몸으로 영우의 집중력을 톡톡 건드린다." },
    { name: "메기", field: "freshwaterBasic", level: 3, hp: 60, resistance: 7, gold: 480, weight: 8, desc: "수염이 영우보다 침착하다." },
    { name: "갈겨니", field: "freshwaterBasic", level: 3, hp: 62, resistance: 8, gold: 520, weight: 7, desc: "물살을 타는 솜씨가 좋다. 영우는 아직 대중교통도 헷갈린다." },
    { name: "배스", field: "freshwaterBasic", level: 3, hp: 65, resistance: 8, gold: 560, weight: 7, desc: "영우가 즐겨먹는 맛있는 반찬." },
    { name: "잉어", field: "freshwaterBasic", level: 4, hp: 80, resistance: 10, gold: 640, weight: 5, desc: "잡는 순간 영우가 잠깐 인생 역전을 꿈꾼다." },
    { name: "강준치", field: "freshwaterBasic", level: 4, hp: 90, resistance: 11, gold: 680, weight: 5, desc: "강물의 준치. 이름에 강이 붙으니 괜히 더 세 보인다." },
    { name: "가물치", field: "freshwaterBasic", level: 4, hp: 100, resistance: 12, gold: 720, weight: 4, desc: "민물계의 근육 담당. 영우는 눈을 피한다." },
    { name: "은어", field: "freshwaterAdvanced", level: 5, hp: 120, resistance: 15, gold: 780, weight: 19, desc: "이름은 은은한데 난이도는 안 은은하다." },
    { name: "향어", field: "freshwaterAdvanced", level: 5, hp: 125, resistance: 16, gold: 820, weight: 17, desc: "향은 좋은데 힘은 안 좋게 세다." },
    { name: "산천어", field: "freshwaterAdvanced", level: 5, hp: 130, resistance: 16, gold: 860, weight: 17, desc: "상쾌한 이름과 달리 영우의 손목을 괴롭힌다." },
    { name: "모래무지", field: "freshwaterAdvanced", level: 5, hp: 138, resistance: 17, gold: 900, weight: 16, desc: "강바닥에 붙어 버틴다. 영우의 퇴근 의지보다 단단하다." },
    { name: "무지개송어", field: "freshwaterAdvanced", level: 6, hp: 150, resistance: 18, gold: 940, weight: 15, desc: "잡으면 화면보다 영우 표정이 더 화려해진다." },
    { name: "마자", field: "freshwaterAdvanced", level: 6, hp: 155, resistance: 19, gold: 980, weight: 14, desc: "이름은 짧은데 버티는 시간은 길다." },
    { name: "꺽저기", field: "freshwaterAdvanced", level: 6, hp: 160, resistance: 20, gold: 1020, weight: 13, desc: "작아 보여도 성질은 만만치 않다." },
    { name: "비단잉어", field: "freshwaterAdvanced", level: 7, hp: 200, resistance: 22, gold: 1100, weight: 10, desc: "비단처럼 우아하고 영우처럼 급하다." },
    { name: "열목어", field: "freshwaterAdvanced", level: 7, hp: 210, resistance: 24, gold: 1150, weight: 9, desc: "차가운 물의 고급 손님. 영우가 괜히 자세를 고친다." },
    { name: "대형 떡붕어", field: "freshwaterAdvanced", level: 7, hp: 220, resistance: 25, gold: 1200, weight: 9, desc: "크다. 떡도 아니다. 그래도 이름은 떡붕어다." },
    { name: "대물메기", field: "freshwaterAdvanced", level: 8, hp: 250, resistance: 30, gold: 1280, weight: 7, desc: "수염 난 보스. 영우가 존댓말을 할 뻔했다." },
    { name: "눈불개", field: "freshwaterAdvanced", level: 8, hp: 265, resistance: 32, gold: 1360, weight: 6, desc: "눈빛이 매섭다. 영우는 괜히 찌를 다시 본다." },
    { name: "뱀장어", field: "freshwaterAdvanced", level: 8, hp: 280, resistance: 35, gold: 1440, weight: 6, desc: "미끄럽다. 영우의 계획처럼." },
    { name: "철갑상어", field: "freshwaterAdvanced", level: 9, hp: 400, resistance: 50, gold: 1900, weight: 4, desc: "갑옷을 입고 나온 듯한 민물 최종 관문." },
    { name: "대물 쏘가리", field: "freshwaterAdvanced", level: 10, hp: 800, resistance: 100, gold: 3500, weight: 1, desc: "민물의 제왕. 영우가 두 손으로도 버거워한다." },
    { name: "멸치", field: "seaNear", level: 3, hp: 40, resistance: 5, gold: 380, weight: 24, desc: "작지만 바다 입문 신고식은 확실하다." },
    { name: "꽁치", field: "seaNear", level: 3, hp: 50, resistance: 6, gold: 460, weight: 21, desc: "영우보다 몸선이 날렵하다." },
    { name: "전갱이", field: "seaNear", level: 3, hp: 55, resistance: 7, gold: 540, weight: 18, desc: "이름은 담백하지만 움직임은 얄밉다." },
    { name: "학꽁치", field: "seaNear", level: 3, hp: 60, resistance: 8, gold: 580, weight: 16, desc: "가늘고 빠르다. 영우의 집중력을 실처럼 잡아당긴다." },
    { name: "고등어", field: "seaNear", level: 4, hp: 70, resistance: 9, gold: 620, weight: 15, desc: "밥상에서는 친근하고 바다에서는 까칠하다." },
    { name: "망상어", field: "seaNear", level: 4, hp: 75, resistance: 10, gold: 660, weight: 14, desc: "이름 때문에 영우가 잠깐 인생 계획을 세웠다." },
    { name: "우럭", field: "seaNear", level: 4, hp: 80, resistance: 10, gold: 700, weight: 13, desc: "우럭아 왜 우럭. 영우가 먼저 울었다." },
    { name: "광어", field: "seaNear", level: 4, hp: 90, resistance: 12, gold: 780, weight: 11, desc: "바닥에 납작 엎드린 실력자." },
    { name: "숭어", field: "seaNear", level: 5, hp: 105, resistance: 13, gold: 850, weight: 10, desc: "훌쩍 튀는 힘이 좋다. 영우의 심장도 같이 뛴다." },
    { name: "감성돔", field: "seaNear", level: 5, hp: 110, resistance: 14, gold: 920, weight: 9, desc: "예민한 입질로 영우의 손끝을 시험한다." },
    { name: "노래미", field: "seaNear", level: 5, hp: 120, resistance: 15, gold: 980, weight: 8, desc: "바위틈의 단골손님. 영우에게는 신규 고객이다." },
    { name: "먹갈치", field: "seaNear", level: 5, hp: 130, resistance: 16, gold: 1050, weight: 7, desc: "반짝임은 고급, 저항은 난폭." },
    { name: "도다리", field: "seaNear", level: 6, hp: 145, resistance: 18, gold: 1120, weight: 6, desc: "납작하게 버티는 바다의 인내심. 영우가 배워야 한다." },
    { name: "방어", field: "seaNear", level: 6, hp: 160, resistance: 20, gold: 1200, weight: 5, desc: "와이프의 마음을 움직일 수 있는 몇 안 되는 생선." },
    { name: "참돔", field: "seaNear", level: 6, hp: 200, resistance: 25, gold: 1500, weight: 3, desc: "참 좋은데 영우한테는 참 어렵다." },
    { name: "농어", field: "seaOcean", level: 7, hp: 250, resistance: 30, gold: 1650, weight: 18, desc: "바다의 중간 보스. 힘을 숨기지 않는다." },
    { name: "볼락", field: "seaOcean", level: 7, hp: 260, resistance: 32, gold: 1720, weight: 17, desc: "작아 보여도 바다보트까지 따라온 이유가 있다." },
    { name: "대구", field: "seaOcean", level: 7, hp: 280, resistance: 35, gold: 1850, weight: 16, desc: "묵직하게 버틴다. 이름처럼 대구대구하다." },
    { name: "돌돔", field: "seaOcean", level: 7, hp: 310, resistance: 38, gold: 2000, weight: 14, desc: "입질부터 돌처럼 묵직하다. 영우의 팔도 돌이 된다." },
    { name: "부시리", field: "seaOcean", level: 8, hp: 350, resistance: 45, gold: 2250, weight: 13, desc: "카니발 트렁크를 가득 채울 만한 묵직한 생선." },
    { name: "벵에돔", field: "seaOcean", level: 8, hp: 370, resistance: 48, gold: 2320, weight: 12, desc: "예민함과 힘을 같이 들고 왔다. 영우는 사과부터 하고 싶다." },
    { name: "민어", field: "seaOcean", level: 8, hp: 400, resistance: 50, gold: 2400, weight: 11, desc: "비싸고 묵직하다. 영우가 가격부터 떠올린다." },
    { name: "다금바리", field: "seaOcean", level: 8, hp: 450, resistance: 55, gold: 2600, weight: 9, desc: "이름만 들어도 고급 횟집 냄새가 난다." },
    { name: "삼치", field: "seaOcean", level: 9, hp: 560, resistance: 65, gold: 2850, weight: 7, desc: "속도가 빠르다. 영우의 후회도 같이 빨라진다." },
    { name: "만새기", field: "seaOcean", level: 9, hp: 600, resistance: 70, gold: 3000, weight: 6, desc: "화려한 색과 달리 영우에게는 살벌하게 달려든다." },
    { name: "능성어", field: "seaOcean", level: 9, hp: 650, resistance: 78, gold: 3200, weight: 5, desc: "이름부터 고급이다. 영우의 손목은 이미 할부 중이다." },
    { name: "황새치", field: "seaOcean", level: 9, hp: 700, resistance: 85, gold: 3350, weight: 5, desc: "긴 주둥이만큼 저항도 길게 간다." },
    { name: "참다랑어", field: "seaOcean", level: 9, hp: 800, resistance: 100, gold: 3700, weight: 4, desc: "잡는 순간 영우가 회식 장소를 검색한다." },
    { name: "백상아리", field: "seaOcean", level: 10, hp: 1200, resistance: 150, gold: 5000, weight: 2, desc: "이빨보다 무서운 것은 준우의 읽씹이다." },
    { name: "돗돔", field: "seaOcean", level: 10, hp: 2000, resistance: 250, gold: 7000, weight: 1, desc: "바다 최종보스. 영우의 낚싯대와 자존심을 동시에 휘게 한다." }
  ];

  const junkData = [
    { name: "승환이의 발 깁스", field: "all", gold: 0, fame: 0, weight: 6, desc: "아픔이 담겨있다." },
    { name: "성범이의 마운자로", field: "all", gold: 0, fame: 0, weight: 6, desc: "비싸게 주고 산것같다." },
    { name: "은지의 맥북", field: "all", gold: 0, fame: 0, weight: 6, desc: "녹슬었다. 다시 바다에 던져놓자." },
    { name: "하빈이의 유니폼", field: "all", gold: 0, fame: 0, weight: 6, desc: "사이즈가 작아 보인다." },
    { name: "종연이의 세차타월", field: "all", gold: 0, fame: 0, weight: 6, desc: "사용된 흔적이 없다." },
    { name: "상규의 암벽신발", field: "all", gold: 500, fame: 0, weight: 5, desc: "잘 미끄러지게 생겼다." },
    { name: "미래의 레인부츠", field: "all", gold: 1000, fame: 0, weight: 5, desc: "신은 흔적이 없다. 당근에 팔자." },
    { name: "익준이의 십자목걸이", field: "all", gold: 1500, fame: 0, weight: 5, desc: "크림에 팔면 짭짤하다." },
    { name: "정환이의 교통카드", field: "all", gold: 2500, fame: 0, weight: 5, desc: "티머니 제품이다. 잔액이 빵빵하다." },
    { name: "성욱이의 결혼반지", field: "all", gold: 5000, fame: 0, weight: 4, desc: "주인이 애타게 찾고 있지만 그러기엔 현재 금값이 너무 올랐다." },
    { name: "재승이의 주식백과", field: "all", gold: 0, fame: 300, weight: 5, desc: "부자가 되는 가이드북." },
    { name: "기영이의 차량장부", field: "all", gold: 0, fame: 700, weight: 5, desc: "기영이한테 돌려주면 보상이 생긴다." },
    { name: "준호의 연애소설", field: "all", gold: 0, fame: 1200, weight: 5, desc: "눈물없인 볼 수 없다." },
    { name: "지민이의 회사통장", field: "all", gold: 0, fame: 2000, weight: 4, desc: "잃어버리면 큰일난다." },
    { name: "가인이의 뿔테안경", field: "all", gold: 0, fame: 3000, weight: 4, desc: "착용 시 JYP소속 아이돌이 될 수 있다." },
    { name: "재모의 오리발", field: "event", gold: 0, fame: 0, weight: 1, rewardLabel: "민물보트", desc: "재모가 잃어버린 오리발." },
    { name: "영우의 초상화", field: "all", gold: 0, fame: 0, weight: 2, rewardLabel: "실물경품", desc: "일반엔딩 이후에야 물가에서 발견되는 액자 속 영우의 초상화. 영우가 기분이 좋아 보일때 가장먼저 보여주는 사람에게 실물경품을 준다. 믿거나 말거나." },
    { name: "준우가 훔친 G70 열쇠", field: "event", gold: 0, fame: 0, weight: 1, rewardLabel: "G70", desc: "백상아리 뱃속에서 찾았다." },
    { name: "영우의 갯바위화", field: "sea", gold: 0, fame: 0, weight: 2, permanentLabel: "안정성 +50", desc: "와이프 몰래 샀다. 미끄러지지 않는다." },
    { name: "와이프의 카드영수증", field: "all", gold: 0, fame: 0, weight: 2, permanentLabel: "감기력 +3.0", desc: "키보드를 또 샀다. 영우 분노로 파워 증가." }
  ];

  const bossMessages = {
    "대물 쏘가리": "수면 아래에서 민물의 제왕이 움직인다...",
    "백상아리": "바다가 조용해졌다. 뭔가 이쪽을 보고 있다.",
    "돗돔": "낚싯줄 끝에서 바다 최종보스의 무게가 느껴진다."
  };

  function weightedPick(items) {
    const total = items.reduce((sum, item) => sum + Math.max(1, item.weight || 1), 0);
    let cursor = Math.random() * total;
    for (const item of items) {
      cursor -= Math.max(1, item.weight || 1);
      if (cursor <= 0) return item;
    }
    return items[0];
  }

  function fameForFish(fish) {
    return fish.level * 50 + fish.resistance * 5 + (fish.level >= 10 ? 250 : 0);
  }

  function getActiveField(state) {
    return fieldData[state.activeField] || fieldData.fresh;
  }

  function selectCatchResult(state, accuracy) {
    const field = getActiveField(state);
    const gearId = state.loadout[field.gearType];
    const gear = gearStats[gearId] || gearStats.toyRod;
    const outfit = outfitStats[state.loadout.outfit] || outfitStats.beginnerOutfit;
    const bonus = titleBonus(state);
    const permanent = permanentBonus(state);
    const score = Number(accuracy || 0) + gear.accuracyBonus;
    const effectivePower = (gear.power + (permanent.powerFlat || 0)) * (1 + (bonus.power || 0)) + score * 0.65;
    const junkChance = Math.max(0.006, 0.035 - score / 1800) * (1 + outfit.lostItemBonus * 0.25 + (bonus.junkChance || 0));

    if (field.id === "fresh" && state.flags.g70_stolen && !state.flags.jaemo_flipper_found) {
      return {
        kind: "event",
        name: "재모의 오리발",
        gold: 0,
        fame: 0,
        rewardLabel: "민물보트",
        fieldName: field.name,
        gearName: gear.name,
        desc: "재모가 잃어버린 오리발."
      };
    }

    const shouldFindJunk = Math.random() < junkChance || (score < field.minAccuracy && Math.random() < 0.08);
    if (shouldFindJunk) {
      const ownedJunk = new Set(state.junk || []);
      const junkPool = junkData.filter((junk) => {
        if (junk.name === "영우의 초상화" && !state.flags.normal_ending_seen) return false;
        return (junk.field === field.junkGroup || junk.field === "all") && !ownedJunk.has(junk.name);
      });
      if (junkPool.length) return { ...weightedPick(junkPool), kind: "junk", fieldName: field.name, gearName: gear.name };
    }

    const canChallengeBoss = field.id === "ocean" && gearId === "legendRod" && score >= 88;
    const fishPool = fishData
      .filter((fish) => fish.field === field.fishGroup)
      .filter((fish) => fish.resistance <= effectivePower + 14 || fish.level <= 2 || (canChallengeBoss && fish.level >= 10))
      .map((fish) => ({
        ...fish,
        weight: (() => {
          const baseWeight = Math.sqrt(Math.max(1, fish.weight || 1));
          const collectionBias = state.caughtFish?.includes(fish.name) ? 0.16 : 2.6;
          const highLevelBias = fish.level >= 7
            ? 1 + outfit.highLevelBonus + (bonus.rareFish || 0)
            : fish.level >= 5
              ? 1 + outfit.highLevelBonus * 0.45
              : 1;
          if (fish.level >= 10 && canChallengeBoss) {
            return Math.max(0.35, baseWeight * (0.55 + outfit.highLevelBonus) * collectionBias);
          }
          return baseWeight * highLevelBias * collectionBias;
        })()
      }));
    const result = weightedPick(fishPool.length ? fishPool : fishData.filter((fish) => fish.field === field.fishGroup));
    return {
      ...result,
      kind: "fish",
      fame: fameForFish(result),
      bossMessage: bossMessages[result.name] || "",
      fieldName: field.name,
      gearName: gear.name,
      outfitName: outfit.name
    };
  }

  function applyCatchResult(state, result) {
    const firstFishCatch = result.kind === "fish" && !state.caughtFish.includes(result.name);
    if (result.kind === "fish" && !state.caughtFish.includes(result.name)) {
      state.caughtFish.push(result.name);
    }

    if (result.kind === "junk" && !state.junk.includes(result.name)) {
      state.junk.push(result.name);
    }

    if (result.kind === "event" && result.name === "재모의 오리발") {
      state.flags.jaemo_flipper_found = true;
      state.flags.valley_boat_owned = true;
      if (!state.junk.includes("재모의 오리발")) state.junk.push("재모의 오리발");
      addItem(state, "boat", "valleyBoat");
      if (state.loadout.boat === "noneBoat") state.loadout.boat = "valleyBoat";
    }

    if (result.kind === "junk" && result.name === "준우가 훔친 G70 열쇠" && !state.flags.g70_key_found) {
      state.flags.g70_key_found = true;
      addItem(state, "vehicle", "g70");
      if (state.loadout.vehicle === "noneVehicle") state.loadout.vehicle = "g70";
    }

    if (firstFishCatch && result.name === "방어" && state.flags.tivoli_confiscated && !state.flags.tivoli_returned) {
      state.flags.tivoli_return_pending = true;
    }

    if (result.kind === "fish" && result.name === "백상아리" && state.flags.g70_stolen && !state.flags.g70_key_found) {
      state.flags.g70_key_found = true;
      if (!state.junk.includes("준우가 훔친 G70 열쇠")) state.junk.push("준우가 훔친 G70 열쇠");
      addItem(state, "vehicle", "g70");
      if (state.loadout.vehicle === "noneVehicle") state.loadout.vehicle = "g70";
    }

    const vehicle = vehicleStats[state.loadout.vehicle] || vehicleStats.noneVehicle;
    const bonus = titleBonus(state);
    const baseGold = result.gold || 0;
    const field = getActiveField(state);
    const titleGoldBonus = (bonus.gold || 0) + (field.gearType === "freshwater" ? (bonus.freshwaterGold || 0) : 0);
    const bonusGold = baseGold > 0 ? Math.floor(baseGold * (vehicle.goldBonus + titleGoldBonus)) : 0;
    result.gold = baseGold + bonusGold;
    state.gold += result.gold;
    const earnedFame = Math.floor((result.fame || 0) * (1 + (bonus.fame || 0)));
    state.fame += earnedFame;
    if (!state.stats) state.stats = { lifetimeGoldEarned: 0, lifetimeFameEarned: 0 };
    state.stats.lifetimeGoldEarned = (state.stats.lifetimeGoldEarned || 0) + Math.max(0, result.gold || 0);
    state.stats.lifetimeFameEarned = (state.stats.lifetimeFameEarned || 0) + Math.max(0, earnedFame || 0);

    return save(state);
  }

  function triggerHomeReturnEvents(state) {
    if (
      state.flags.tivoli_confiscated
      && !state.flags.tivoli_returned
      && state.flags.tivoli_return_pending
    ) {
      state.flags.tivoli_returned = true;
      delete state.flags.tivoli_return_pending;
      addItem(state, "vehicle", "tivoli");
      if (state.loadout.vehicle === "noneVehicle") state.loadout.vehicle = "tivoli";
      queueEvent(state, "tivoli_returned");
      return { triggered: "tivoli_returned", state: save(state) };
    }
    return { triggered: false, state: save(state) };
  }

  function triggerFirstLeisureBreak(state) {
    if (state.loadout.sea !== "firstLeisure" || state.flags.first_leisure_broken) return { triggered: false, state };
    state.flags.first_leisure_first_cast = true;
    state.flags.first_leisure_broken = true;
    removeItem(state, "sea", "firstLeisure");
    state.loadout.sea = "noneSea";
    return { triggered: true, state: save(state) };
  }

  function triggerGarageReturnEvents(state, options = {}) {
    if (state.flags.first_leisure_broken && state.flags.g70_purchased && !state.flags.g70_stolen) {
      state.flags.g70_stolen = true;
      removeItem(state, "vehicle", "g70");
      if (state.loadout.vehicle === "g70") state.loadout.vehicle = "noneVehicle";
      if (options.queue !== false) queueEvent(state, "g70_stolen");
      return { triggered: "g70_stolen", state: save(state) };
    }
    return { triggered: false, state: save(state) };
  }

  function currentGoal(state) {
    const safeState = normalizeState(mergeDefaults(state));
    const has = (type, itemId) => hasItem(safeState, type, itemId);
    const goldNeeded = (price) => Math.max(0, price - safeState.gold);
    const objectParticle = (word) => {
      const last = [...String(word)].pop();
      if (!last) return "을";
      const code = last.charCodeAt(0);
      if (code < 0xac00 || code > 0xd7a3) return "을";
      return (code - 0xac00) % 28 === 0 ? "를" : "을";
    };
    const needGoldLine = (price, target) => {
      const needed = goldNeeded(price);
      return needed > 0 ? `${target}까지 ${needed.toLocaleString()}G 더 필요하다.` : `${target}${objectParticle(target)} 상점에서 살 수 있다.`;
    };

    if (safeState.flags.true_ending_seen) {
      return {
        title: "진엔딩 확인",
        lines: ["[목표] 진엔딩을 확인하자.", "남영우 낚시기념관 개장 조건을 모두 채웠다.", "아빠는 약속을 지켰고, 박물관을 차렸다."]
      };
    }

    if (safeState.flags.normal_ending_seen && !safeState.flags.true_ending_seen) {
      const titleScreenCount = [
        safeState.flags.intro_complete,
        safeState.flags.valley_boat_owned,
        safeState.flags.sea_boat_owned
      ].filter(Boolean).length;
      const achievementTitleCount = Object.keys(titleDefinitions)
        .filter((titleId) => safeState.titles?.owned?.includes(titleId))
        .length;
      return {
        title: "진엔딩 준비",
        lines: [
          "[목표] 유실물, 메인화면, 칭호까지 모두 모으자.",
          `유실물 ${safeState.junk.length}/${junkData.length} · 메인화면 ${titleScreenCount}/3 · 칭호 ${achievementTitleCount}/${Object.keys(titleDefinitions).length}`,
          "일반엔딩은 봤지만 영우의 수집병은 아직 퇴근하지 않았다."
        ]
      };
    }

    if (safeState.flags.g70_stolen && !safeState.flags.jaemo_flipper_found) {
      return {
        title: "환불 시도",
        lines: ["[목표] 상점에 환불하러 가보자.", "부러진 제1레져를 들고 상점주인을 찾아가자.", "환불이 될지는 모르지만 일단 따져보자."]
      };
    }

    if (safeState.flags.valley_boat_owned && !safeState.flags.carnival_owned) {
      return {
        title: "카니발 준비",
        lines: ["[목표] 카니발을 준비하자.", needGoldLine(14000, "카니발"), "넉넉한 짐칸이 있으면 다음 바다 준비도 훨씬 편해진다."]
      };
    }

    if (safeState.flags.carnival_owned && safeState.flags.first_leisure_broken && !safeState.flags.first_leisure_exchanged) {
      return {
        title: "제1레져 교환",
        lines: ["[목표] 상점에서 부러진 제1레져를 새 제1레져로 교환하자.", "카니발을 뽑은 뒤로 상점 사장의 태도가 달라졌다.", "고급차 고객 특별 서비스가 뭔지 확인해보자."]
      };
    }

    if (safeState.flags.carnival_owned && !safeState.flags.g70_key_drop_seen) {
      return {
        title: "바다 재도전",
        lines: ["[목표] 카니발과 교환받은 제1레져로 바다에 다시 나가자.", "창고에서 제1레져 장착을 확인하자.", "같은 제품 두 번째라 이번엔 상점주인도 땀을 흘린다."]
      };
    }

    if (safeState.flags.sea_boat_unlocked && !safeState.flags.sea_boat_owned) {
      return {
        title: "바다보트 구매",
        lines: ["[목표] 바다보트를 상점에서 사자.", needGoldLine(20000, "바다보트"), "대양으로 나가려면 지갑도 같이 출항해야 한다."]
      };
    }

    if (safeState.flags.sea_boat_owned && !has("outfit", "premiumOutfit")) {
      if (!has("outfit", "midOutfit")) {
        return {
          title: "중급 낚시복 준비",
          lines: ["[목표] 중급 낚시복을 준비하자.", needGoldLine(1800, "중급 낚시복"), "Lv.2 낚시장비를 쓰려면 옷부터 티어를 맞추자."]
        };
      }
      return {
        title: "고급 낚시복 준비",
        lines: ["[목표] 고급 낚시복을 준비하자.", needGoldLine(11000, "고급 낚시복"), "Lv.3 낚시장비를 들기 전에 영우의 외형부터 전설에 맞추자."]
      };
    }

    if (safeState.flags.sea_boat_owned && !has("sea", "legendRod")) {
      return {
        title: "전설의 낚시세트 준비",
        lines: ["[목표] 전설의 낚시세트를 준비하자.", needGoldLine(30000, "전설의 낚시세트"), "백상아리와 돗돔은 장비 핑계를 귀신같이 알아본다."]
      };
    }

    if (safeState.flags.sea_boat_owned && !safeState.flags.g70_key_found) {
      return {
        title: "G70 차키 회수",
        lines: ["[목표] 백상아리를 잡아 G70 차키를 되찾자.", "대양에서 백상아리를 노리자.", "준우의 범행 현장이 이제 생태계까지 번졌다."]
      };
    }

    if (safeState.flags.sea_boat_owned && !safeState.flags.tivoli_returned) {
      return {
        title: "티볼리 반환",
        lines: ["[목표] 방어를 잡고 홈으로 돌아가 티볼리 반환 기회를 만들자.", "와이프가 좋아하는 생선은 협상력이 있다.", "영우의 가정 평화가 비늘에 걸려 있다."]
      };
    }

    if (safeState.flags.sea_boat_owned) {
      return {
        title: "60종 도감 완성",
        lines: ["[목표] 도감 60종을 채우자.", `현재 ${safeState.caughtFish.length}/${fishData.length}종을 기록했다.`, "아들과의 약속이 드디어 숫자로 보이기 시작한다."]
      };
    }

    if (safeState.flags.tivoli_confiscated && !safeState.flags.g70_purchased) {
      return {
        title: "G70 구매",
        lines: ["[목표] G70을 상점에서 사자.", needGoldLine(4500, "G70"), "티볼리 없는 영우에게 바다는 지도 앱에서도 멀다."]
      };
    }

    if (
      safeState.flags.tivoli_confiscated
      && safeState.flags.g70_purchased
      && !safeState.flags.first_leisure_broken
      && has("sea", "firstLeisure")
    ) {
      return {
        title: "바다 재시도",
        lines: ["[목표] G70과 제1레져로 바다에 다시 가보자.", "창고에서 제1레져와 G70 장착을 확인하자.", "준비가 됐으면 바다 낚시를 눌러보자."]
      };
    }

    if (!safeState.flags.tivoli_confiscated && !has("sea", "firstLeisure") && safeState.gold < 3000) {
      return {
        title: "민물 자금 마련",
        lines: ["[목표] 민물낚시로 돈을 벌어 바다로 가보자.", needGoldLine(3000, "제1레져 낚시세트"), "피라미도 모이면 바다 입장권이 된다."]
      };
    }

    if (!safeState.flags.first_leisure_broken && !has("sea", "firstLeisure")) {
      return {
        title: "첫 바다 장비 준비",
        lines: ["[목표] 제1레져 낚시세트를 상점에서 사자.", needGoldLine(3000, "제1레져 낚시세트"), "첫 바다 도전은 설렘과 영수증으로 시작된다."]
      };
    }

    if (!safeState.flags.tivoli_confiscated) {
      return {
        title: "첫 바다 도전",
        lines: ["[목표] 제1레져와 티볼리로 바다에 도전하자.", "창고에서 제1레져 장착을 확인하고 바다 낚시를 누르자.", "준비가 끝났다면 첫 바다로 나가보자."]
      };
    }

    return {
      title: "민물 자금 마련",
      lines: ["[목표] 민물에서 돈을 모으자.", "다음 장비 가격표가 이미 영우를 보고 있다.", "피라미도 모이면 할부보다 강하다."]
    };
  }

  window.GameState = {
    STORAGE_KEY,
    defaultState,
    fieldData,
    gearStats,
    gearLevels,
    outfitLevels,
    outfitStats,
    vehicleStats,
    titleDefinitions,
    fishData,
    junkData,
    bossMessages,
    load,
    save,
    reset,
    hasItem,
    canEquipWithOutfit,
    addItem,
    removeItem,
    grantTitle,
    setEquippedTitle,
    consumeTitleNotices,
    displayYoungwooName,
    titleBonus,
    permanentBonus,
    setLoadout,
    setFlag,
    clearFlag,
    eventDefinitions,
    endingEventIds,
    achievementEventIds,
    queueEvent,
    collectEnding,
    collectAchievement,
    collectAvailableEndings,
    isEndingEvent,
    isAchievementEvent,
    peekEvent,
    peekPendingEnding,
    consumeEvent,
    triggerTivoliConfiscation,
    getActiveField,
    selectCatchResult,
    applyCatchResult,
    triggerHomeReturnEvents,
    triggerFirstLeisureBreak,
    triggerGarageReturnEvents,
    currentGoal
  };
})();




