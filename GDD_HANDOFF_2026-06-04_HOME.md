# 낚시왕 영우 GDD / 집에서 이어가기 저장본

작성일: 2026-06-04

## 1. 현재 작업 폴더

```text
C:\Users\PC\Documents\Codex\2026-06-04
```

## 2. 오늘 오후 최종 요약

- 보트 2종을 256 투명 PNG 품질로 재생성/적용했다.
- 의상 3종을 256 투명 PNG로 재생성/적용했다.
- 낚시장비 아이콘 7종과 필드용 `tackle_*` 이미지를 256 품질로 맞췄다.
- 와이프 이모지 2종을 256 품질로 교체했다.
- 상점주인 이모지와 전신 스프라이트를 적용했다.
- 상점주인 대사가 나올 때 상점 화면에 전신 스프라이트가 표시되도록 연결했다.
- 준우 이모지 3종은 사진 기준 재작업 후, 정장 실사풍 버전을 폐기하고 흰 티/굵은 선/단순 음영 버전으로 교체했다.
- 재모 이모지는 256 품질로 교체했다.
- 영우 이모지는 여러 번 재시도했지만 최종 롤백했다.

## 3. 에셋 최신 상태

### 3.1 보트

갱신 파일:

- `assets/valley_boat_right.png`
- `assets/valley_boat_left.png`
- `assets/sea_boat_right.png`
- `assets/sea_boat_right_v2.png`
- `assets/sea_boat_left.png`
- `assets/valley_boat_sprite_sheet.png`
- `assets/sea_boat_sprite_sheet.png`

적용 화면:

- `fishing_screen.html`
- `game_home.html`
- `home_layout_preview.html`
- `shop_screen.html`
- `field_variants.html`

백업:

- `assets/boat_icon_backup_20260604`

프리뷰:

- `work/boat_regen/boat_quality_256_contact.png`

### 3.2 의상

갱신 파일:

- `assets/outfit_beginner_icon.png`
- `assets/outfit_mid_icon.png`
- `assets/outfit_premium_icon.png`

의상 기준:

- 입문: 빨강 후드 + 파랑 조끼
- 중급: 청록 후드 + 검정 조끼
- 고급: 남색 안쪽 옷 + 흰색/아이보리 조끼 + 금색 포인트

적용 화면:

- `game_home.html`
- `shop_screen.html`
- `home_layout_preview.html`

백업:

- `assets/outfit_icon_backup_20260604`

프리뷰:

- `work/outfit_icon_256/outfit_icon_256_contact.png`

### 3.3 낚시장비

갱신 파일:

- `assets/rod_toy_icon.png`
- `assets/rod_ali_icon.png`
- `assets/rod_japan_icon.png`
- `assets/rod_first_leisure_icon.png`
- `assets/rod_first_leisure_broken_icon.png`
- `assets/rod_temu_icon.png`
- `assets/rod_legend_icon.png`

필드용 이미지:

- `assets/tackle_toyRod.png`
- `assets/tackle_aliRod.png`
- `assets/tackle_japanRod.png`
- `assets/tackle_firstLeisure.png`
- `assets/tackle_temuRod.png`
- `assets/tackle_legendRod.png`

백업:

- `assets/rod_icon_backup_20260604`

## 4. 캐릭터 이모지 / 스프라이트 최신 상태

### 4.1 와이프

갱신 파일:

- `assets/wife_approve.png`: 방어 이벤트 / 티볼리 반환 이벤트용 와이프 이모지
- `assets/wife_confiscate.png`: 티볼리 압수 이벤트용 와이프 이모지

적용:

- `game_home.html` 캐시 버전 갱신 완료.

백업:

- `assets/wife_backup_20260604`

프리뷰:

- `work/wife_emoji_256/wife_emoji_256_contact.png`

### 4.2 상점주인

갱신 파일:

- `assets/shop_owner_sprites/shop_owner_emoji_rich.png`
- `assets/shop_owner_sprites/shop_owner_sprite_cover_poster.png`

현재 동작:

- 제1레져 환불불가/교환 흐름에서 포스터를 가리는 전신 스프라이트가 나온다.
- `shop_screen.html`에서 대사창 화자가 상점주인일 때도 상점 안에 전신 스프라이트가 표시된다.

백업:

- `assets/shop_owner_sprites/shop_owner_backup_20260604`

프리뷰:

- `work/shop_owner_fullbody_sprite/shop_owner_fullbody_sprite_contact.png`

### 4.3 준우

갱신 파일:

- `assets/junwoo_sprites/junwoo_emoji_laugh.png`
- `assets/junwoo_sprites/junwoo_emoji_crying.png`
- `assets/junwoo_sprites/junwoo_emoji_smirk.png`

중요 메모:

- 사진 기준 정장 버전은 재모보다 실사 느낌이 강해서 폐기했다.
- 현재 적용본은 흰 티, 굵은 선, 단순 음영의 저디테일 버전이다.
- 그래도 집에서 다시 보면 너무 조잡하거나 너무 단순할 수 있으니 재모와 나란히 비교 필요.

적용 화면:

- `game_home.html`
- `fishing_screen.html`

백업:

- `assets/junwoo_sprites/junwoo_backup_20260604`
- `assets/junwoo_sprites/junwoo_backup_before_low_detail_fix_20260604`

프리뷰:

- `work/junwoo_low_detail_fix/junwoo_low_detail_fix_contact.png`

### 4.4 재모

갱신 파일:

- `assets/jaemo_sprites/jaemo_emoji_kind_smile.png`

백업:

- `assets/jaemo_sprites/jaemo_backup_20260604`

주의:

- `game_home.html` 쪽 캐시 문자열은 아직 예전 `?v=jaemo-20260531`이다.
- 집에서 재모가 안 바뀐 것처럼 보이면 캐시 문자열만 새 버전으로 바꾸면 된다.

### 4.5 영우

현재 상태:

- 영우 이모지는 최종 롤백했다.
- `assets/youngwoo_sprites/portrait_emotions_2x`는 이전 상태다.
- 새로 만든 정면/재모톤 54장 세트는 적용하지 않았다.

백업:

- `assets/youngwoo_sprites/portrait_emotions_2x_backup_before_straight_jaemo_20260604`
- `assets/youngwoo_sprites/portrait_emotions_2x_backup_20260604`

다음 시도 기준:

- 고개는 똑바로.
- 실사 느낌 금지.
- 사진은 얼굴 특징 참고용만.
- 재모 정도의 단순화.
- 얼굴만 붙인 합성 느낌 금지.
- 모자는 복장별로 새로 창조하되 얼굴은 같은 사람으로 유지.

참고 프리뷰:

- `work/youngwoo_face_only_sample/youngwoo_face_only_beginner_contact.png`
- `work/youngwoo_redraw_straight_jaemo_level/youngwoo_straight_jaemo_level_contact.png`

## 5. 낚시 필드 / 게임플레이 최신 상태

### 5.1 유실물

- 유실물은 획득 직후 바로 다시 생기지 않도록 지연 스폰 구조로 바꿨다.
- 관련 흐름:
  - `nextJunkDriftAt`
  - `spawnDelayedJunkSwimmer`
- 재모 오리발은 필드에서 실루엣이 아니라 원본 이미지가 보인다.
- 재모 오리발은 물 위에 둥둥 떠다니는 예외 유실물이다.

### 5.2 물고기 움직임

- 회유성 어종은 빠르게 나타났다 사라지는 방향.
- 락피쉬/광어 계열은 움직임이 적고 바닥 쪽에 머무르는 방향.
- Y축 움직임은 너무 흔들리지 않도록 줄였다.

### 5.3 포식자

- 포식자는 항상 존재하지 않는다.
- 랜덤하게 필드 밖으로 나갔다가 한참 뒤 다시 들어온다.
- 포식자가 나타나면 일반 물고기는 필드 밖으로 사라지는 것이 아니라 다른 위치로 천천히 피한다.
- 회피 속도는 너무 빠르지 않게 조정했다.

### 5.4 입질 톡톡

- 물고기가 톡톡 건드릴 때 성공률이 올라간다.
- 쉬는 구간에는 성공률이 내려간다.
- 이 흐름이 몇 번 반복된 뒤 도망가는 구조.
- 현재 체감은 아직 테스트 필요.

## 6. 오디오 최신 상태

- 게임 오디오 기반을 추가했다.
- 필요한 소리 구조:
  - BGM
  - 필드별 배경음
  - 파도 소리
  - 갈매기 소리
  - 버튼/구매/이벤트/낚시 효과음
- 영우 음성은 아이디어 단계이며 완성 보이스셋은 아니다.

## 7. 진행/상점 최신 기준

### 7.1 가격

- 중급 낚시복: 1,800G
- 고급 낚시복: 11,000G
- 알리산: 2,800G
- 일본산: 7,500G
- 제1레져: 3,000G
- 테무산: 11,000G
- 전설: 30,000G
- G70: 4,500G
- 카니발: 14,000G
- 바다보트: 20,000G

### 7.2 의상/장비 구조

- Lv.2 낚시장비는 중급 낚시복이 있어야 구매/사용 흐름이 자연스럽다.
- Lv.3 낚시장비는 고급 낚시복과 이전 티어 장비가 필요하다.
- 옷값은 낮추고 낚시대 가격을 올리는 구조로 정리했다.

### 7.3 제1레져 흐름

- 제1레져 파손 후 상점은 환불불가 포스터를 보여준다.
- 카니발 구매 뒤 상점주인 태도가 바뀌고 새 제1레져로 교환해준다.
- 상점주인 전신 스프라이트는 이 코미디 연출의 핵심이다.

### 7.4 호칭

- `뚜벅이` 호칭은 티볼리 압수 이벤트 확인 뒤 다음 대사창 흐름에서 획득하는 방향이다.
- 호칭 획득 이벤트는 일반 이벤트 보라색과 다른 색으로 구분하는 방향이다.

## 8. 집에서 우선 테스트할 것

1. `shop_screen.html`에서 상점주인 대사 시 전신 스프라이트 표시 확인.
2. 홈/상점/필드에서 보트, 의상, 장비 에셋이 잘리지 않는지 확인.
3. `fishing_screen.html`에서 유실물 획득 후 즉시 재스폰되지 않는지 확인.
4. 재모 오리발이 원본 이미지로 물 위에 떠다니고, 한자리에만 있지 않은지 확인.
5. 포식자 등장/퇴장, 일반 물고기 회피 속도 확인.
6. 입질 톡톡 속도가 너무 빠르지 않은지 확인.
7. 준우 새 저디테일 이모지가 재모 수준으로 보이는지 확인.
8. 재모 이모지가 캐시 때문에 예전처럼 보이면 캐시 버전 갱신.
9. 영우 이모지 방향 다시 확정.

## 9. 검증 메모

- 여러 HTML의 inline script 문법 검사를 수행했다.
- 이미지들은 대부분 `256x256` RGBA, 모서리 투명, 여백 있음 기준으로 검사했다.
- 이 환경에서는 `git` 명령이 잡히지 않아 git 상태 확인은 못 했다.
