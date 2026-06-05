(function () {
  const base = "./assets/junk_new/quality_256/";
  const silhouetteBase = "./assets/junk_new/quality_256_silhouette/";
  const waterSilhouetteBase = "./assets/junk_new/water_silhouette/";
  const byName = Object.create(null);

  function add(name, file) {
    byName[name] = {
      sprite: `${base}${file}?v=junk-quality-20260605`,
      silhouette: `${silhouetteBase}${file}?v=junk-quality-silhouette-20260604`,
      waterSilhouette: `${waterSilhouetteBase}${file}?v=junk-water-silhouette-20260604`
    };
  }

  add("승환이의 발 깁스", "junk_01_cast.png");
  add("성범이의 마운자로", "junk_02_mounjaro.png");
  add("은지의 맥북", "junk_03_macbook.png");
  add("하빈이의 유니폼", "junk_04_uniform.png");
  add("종연이의 세차타월", "junk_05_towel.png");
  add("상규의 암벽신발", "junk_06_climbing_shoe.png");
  add("미래의 레인부츠", "junk_07_rain_boots.png");
  add("익준이의 십자목걸이", "junk_08_cross_necklace.png");
  add("정환이의 교통카드", "junk_09_transport_card.png");
  add("성욱이의 결혼반지", "junk_10_wedding_ring.png");
  add("재승이의 주식백과", "junk_11_stock_book.png");
  add("기영이의 차량장부", "junk_12_vehicle_ledger.png");
  add("준호의 연애소설", "junk_13_romance_book.png");
  add("지민이의 회사통장", "junk_14_company_bankbook.png");
  add("가인이의 뿔테안경", "junk_15_black_glasses.png");
  add("재모의 오리발", "junk_16_flipper.png");
  add("영우의 초상화", "junk_17_youngwoo_portrait.png");
  add("준우가 훔친 G70 열쇠", "junk_18_g70_key.png");
  add("영우의 갯바위화", "junk_19_rock_shoes.png");
  add("와이프의 카드영수증", "junk_20_card_receipt.png");

  window.JunkSprites = {
    byName,
    src(name, locked = false) {
      const entry = byName[name];
      if (!entry) return "";
      return locked ? entry.silhouette : entry.sprite;
    },
    waterSrc(name) {
      return byName[name]?.waterSilhouette || "";
    }
  };
}());
