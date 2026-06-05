(function () {
  const base = "./assets/fish_new/quality_256/";
  const byName = Object.create(null);

  function add(name, file) {
    byName[name] = {
      sprite: `${base}${file}?v=quality-fish-20260603`,
      silhouette: `./assets/fish_new/quality_256_silhouette/${file}?v=quality-silhouette-20260604`
    };
  }

  add("피라미", "fish_01_pirami.png");
  add("블루길", "fish_02_bluegill_game.png");
  add("빙어", "fish_03_bingeo.png");
  add("붕어", "fish_04_bungeo.png");
  add("참붕어", "fish_05_cham_bungeo.png");
  add("끄리", "fish_06_kkeuri.png");
  add("꺾지", "fish_07_kkeokji.png");
  add("누치", "fish_08_nuchi.png");
  add("동자개", "fish_09_dongjagae.png");
  add("메기", "fish_10_megi.png");
  add("갈겨니", "fish_11_galgyeoni.png");
  add("배스", "fish_12_bass.png");
  add("잉어", "fish_13_carp.png");
  add("강준치", "fish_14_gangjunchi.png");
  add("가물치", "fish_15_gamulchi.png");
  add("은어", "fish_16_euneo.png");
  add("향어", "fish_17_hyangeo.png");
  add("산천어", "fish_18_sancheoneo.png");
  add("모래무지", "fish_19_moraemuji.png");
  add("무지개송어", "fish_20_rainbow_trout.png");
  add("마자", "fish_21_maja.png");
  add("꺽저기", "fish_22_kkeokjeogi.png");
  add("비단잉어", "fish_23_koi.png");
  add("열목어", "fish_24_yeolmokeo.png");
  add("대형 떡붕어", "fish_25_large_crucian.png");
  add("대물메기", "fish_26_giant_catfish.png");
  add("눈불개", "fish_27_nunbulgae.png");
  add("뱀장어", "fish_28_eel.png");
  add("철갑상어", "fish_29_sturgeon.png");
  add("대물 쏘가리", "fish_30_mandarin.png");
  add("멸치", "fish_31_anchovy.png");
  add("꽁치", "fish_32_saury.png");
  add("전갱이", "fish_33_horse_mackerel.png");
  add("학꽁치", "fish_34_halfbeak.png");
  add("고등어", "fish_35_mackerel.png");
  add("망상어", "fish_36_mangsangeo.png");
  add("우럭", "fish_37_rockfish.png");
  add("광어", "fish_38_flounder.png");
  add("숭어", "fish_39_mullet.png");
  add("감성돔", "fish_40_black_bream.png");
  add("노래미", "fish_41_greenling.png");
  add("먹갈치", "fish_42_cutlassfish.png");
  add("도다리", "fish_43_dodari.png");
  add("방어", "fish_44_yellowtail.png");
  add("참돔", "fish_45_red_seabream.png");
  add("농어", "fish_46_seabass.png");
  add("볼락", "fish_47_bolrak.png");
  add("대구", "fish_48_cod.png");
  add("돌돔", "fish_49_doldom.png");
  add("부시리", "fish_50_busiri.png");
  add("벵에돔", "fish_51_bengedom.png");
  add("민어", "fish_52_croaker.png");
  add("다금바리", "fish_53_grouper.png");
  add("삼치", "fish_54_samchi.png");
  add("만새기", "fish_55_mahimahi.png");
  add("능성어", "fish_56_neungseongeo.png");
  add("황새치", "fish_57_swordfish.png");
  add("참다랑어", "fish_58_tuna.png");
  add("백상아리", "fish_59_shark.png");
  add("돗돔", "fish_60_dotdom.png");

  window.FishSprites = {
    byName,
    src(name, locked = false) {
      const entry = byName[name];
      if (!entry) return "";
      return locked ? entry.silhouette : entry.sprite;
    }
  };
}());
