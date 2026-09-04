# PRD: Insight Analytics + Cat Companion (v2)

**Product:** TungMeow (ตังค์เหมียว)
**Author:** Minju (product thinking partner) กับ P'Earth
**Date:** 2026-09-02
**Status:** Draft — ready for engineering review
**Depends on:** `PRD-insight-cat-features-v1.md` (v1: Spending Anomaly Alert, Category Drilldown, Cat Mood Mascot, Logging Streak)

---

## Problem Statement

v1 ตอบคำถาม "เกิดอะไรขึ้นกับเงินฉัน" (anomaly, category breakdown) และสร้าง emotional touchpoint เบื้องต้น (mascot, streak) แต่ยังขาด 2 มิติสำคัญ

**มิติแรก — การมองไปข้างหน้า:** v1 ทั้งหมดเป็น insight เชิงย้อนหลัง (สรุปสิ่งที่เกิดขึ้นแล้ว) ไม่มีฟีเจอร์ไหนช่วยผู้ใช้ *วางแผนล่วงหน้า* หรือ *ควบคุมพฤติกรรมในอนาคต* — Budget Cap และ Cash Flow Forecast ในเอกสารนี้เติมช่องว่างนี้

**มิติที่สอง — แรงจูงใจระยะยาว:** Logging Streak ใน v1 เป็นแรงจูงใจแบบวันต่อวัน แต่ไม่มีเป้าหมายระยะยาวที่จับต้องได้ (เช่น เก็บเงินไปเพื่ออะไร) และไม่มีระบบตอบแทนพฤติกรรมดีแบบสะสม — Savings Goal, Achievement Badge, และ Monthly Wrap-up เติมช่องว่างนี้

เอกสารนี้ครอบคลุม 6 ฟีเจอร์ที่เหลือจากการ brainstorm เดิม แบ่งเป็น Insight 3 ตัว (Budget Cap, Cash Flow Forecast, Health Score) และธีมแมว 3 ตัว (Savings Goal, Achievement Badge, Monthly Wrap-up)

## Goals

1. **เปลี่ยนจาก insight เชิงย้อนหลังเป็นเชิงป้องกัน** — ผู้ใช้รู้ล่วงหน้าว่ากำลังจะเกินงบหรือเงินจะไม่พอ ก่อนที่มันจะเกิดขึ้นจริง ไม่ใช่รู้หลังจากเกิดแล้วเหมือน Anomaly Alert ใน v1
2. **ให้ผู้ใช้มีเป้าหมายทางการเงินที่จับต้องได้** ผูกกับ mascot และธีมแมวที่มีอยู่แล้ว แทนที่จะจดบันทึกโดยไม่มีจุดหมาย
3. **เพิ่ม retention ระยะยาวผ่านระบบตอบแทนสะสม** (badge) ที่ต่อยอดจาก Logging Streak ใน v1 แทนที่จะปล่อยให้ streak เป็นแรงจูงใจตัวเดียวที่ไม่มีจุดสิ้นสุด
4. **สร้างจุดแชร์ (shareability)** ที่ทำให้ TungMeow ถูกพูดถึงนอกวงผู้ใช้เดิม ผ่าน Monthly Wrap-up
5. **ให้สรุปสถานะการเงินแบบเข้าใจได้ในแวบเดียว** สำหรับผู้ใช้ที่ไม่อยากอ่านตัวเลขละเอียดแบบ Anomaly Alert หรือ Category Drilldown

## Non-Goals

- **ไม่ทำ AI/LLM integration** — ยังคงเป็นหัวข้อแยกที่ P'Earth ขอพักไว้ก่อน เหมือนที่ระบุใน v1
- **ไม่ทำ multi-user / shared budget** — Budget Cap และ Savings Goal ในเอกสารนี้ยังคงเป็น single-user scope เหมือน v1 ทั้งหมด
- **ไม่ทำ push notification จริง** — Budget Cap alert และ Badge unlock ในเวอร์ชันนี้ยังเป็น in-app only เหมือน v1
- **ไม่ทำ Achievement Badge ที่ต้องเชื่อมกับระบบภายนอก** (เช่น social sharing badge, leaderboard เทียบผู้ใช้อื่น) — เพราะ TungMeow ยังเป็น single-user
- **ไม่รื้อ data model เดิมของ Transaction/Account** — ฟีเจอร์ที่ต้องเก็บข้อมูลใหม่ (Budget Cap, Savings Goal, Badge) จะเพิ่มเป็น **entity ใหม่แยกต่างหาก** ไม่แก้ schema เดิมที่มีอยู่แล้ว
- **Monthly Wrap-up ไม่ทำเป็นระบบแชร์โซเชียลเต็มรูปแบบ** (เช่น auto-post, deep link tracking) — v2 ทำแค่ generate การ์ดภาพให้แคปแชร์เอง

---

# กลุ่ม A: Insight (ต่อยอดจาก v1)

## A1. Budget Cap เตือนใกล้เกิน

### User Stories
- As a ผู้ใช้, I want ตั้งวงเงินรายจ่ายต่อหมวดหมู่ต่อเดือน so that ฉันมีเป้าหมายชัดเจนแทนการใช้จ่ายแบบไม่มีขอบเขต
- As a ผู้ใช้, I want เห็น progress bar แสดงว่าใช้ไปเท่าไหร่ของวงเงินแต่ละหมวด so that ฉันประเมินสถานการณ์ได้ทันทีโดยไม่ต้องคำนวณเอง
- As a ผู้ใช้ที่ใกล้ชนวงเงิน, I want ได้รับการเตือนก่อนเกินจริง (เช่น ที่ 80%) so that ฉันปรับพฤติกรรมได้ทันก่อนสาย
- As a ผู้ใช้ที่ยังไม่ได้ตั้งวงเงิน, I want ไม่เห็น progress bar หรือ error ใด ๆ so that ฟีเจอร์นี้ไม่รบกวนผู้ใช้ที่ไม่ต้องการใช้งาน

### Requirements

**P0 — Must-Have**
- เพิ่ม entity ใหม่ `BudgetCap` (ไม่แก้ schema เดิม): `{ category, monthlyLimit, createdAt }` — เก็บเป็น sheet tab ใหม่แยกต่างหาก เช่น `_BudgetCaps` เพื่อไม่ปนกับ transaction data
- หน้า Settings เพิ่มส่วนตั้งค่า Budget Cap ต่อหมวดหมู่ (ใช้ fixed category list เดิมจาก `Categories.gs`)
- Dashboard แสดง progress bar ต่อหมวดที่ตั้งวงเงินไว้ (คำนวณจาก expense ของงวดปัจจุบันหารด้วย `monthlyLimit`)
- Threshold เตือน: แสดงสถานะเปลี่ยนสี (เขียว < 80%, เหลือง 80-100%, แดง > 100%)

**Acceptance Criteria**
- [ ] Given ผู้ใช้ตั้งวงเงินหมวด Food ที่ 5,000, When รายจ่าย Food เดือนนี้ = 4,200, Then progress bar แสดง 84% สถานะเหลือง
- [ ] Given ผู้ใช้ไม่ได้ตั้งวงเงินหมวดใดเลย, When เปิด Dashboard, Then ไม่แสดง progress bar ส่วนนี้เลย (ไม่ error)
- [ ] Given รายจ่ายหมวดใดเกินวงเงิน 100%, When แสดงผล, Then สถานะเป็นแดงและมีข้อความชัดเจนว่าเกินไปเท่าไหร่
- [ ] Given ผู้ใช้แก้ไขวงเงินระหว่างเดือน, When บันทึก, Then progress bar คำนวณใหม่ทันทีตามวงเงินล่าสุด (ไม่ retroactive เปลี่ยนข้อมูลเก่า)

**P1 — Nice-to-Have**
- ตั้งวงเงินรวมทั้งเดือน (ไม่แยกหมวด) เป็นทางเลือกสำหรับผู้ใช้ที่ไม่อยากตั้งละเอียด
- แจ้งเตือนแบบ progressive (เช่น เตือนที่ 80% ครั้งเดียว ไม่ spam ทุกครั้งที่เปิดแอป)

**P2 — Future**
- วงเงินแบบ rollover (เดือนนี้เหลือ ยกไปเดือนหน้า)
- เชื่อมกับ Anomaly Alert (v1) ให้ใช้ threshold เดียวกันหรือ cross-reference กัน

### Technical Considerations
- **นี่คือฟีเจอร์เดียวในเอกสารนี้ที่ต้องแก้ Apps Script backend จริงจัง** — ต้องเพิ่ม action ใหม่ใน `Router.gs` (เช่น `getBudgetCaps`, `setBudgetCap`) และ sheet tab ใหม่ ต่างจาก v1 ทั้งหมดที่ frontend-only
- Effort สูงสุดในบรรดา 6 ฟีเจอร์นี้ เพราะแตะทั้ง data model ใหม่ + backend action ใหม่ + UI ใหม่

---

## A2. Cash Flow Forecast

### User Stories
- As a ผู้ใช้, I want เห็นตัวเลขคาดการณ์ยอดคงเหลือสิ้นเดือนจาก pattern การใช้จ่ายปัจจุบัน so that ฉันรู้ล่วงหน้าว่าจะขาดหรือเหลือเงินก่อนถึงวันจริง
- As a ผู้ใช้ที่เพิ่งเริ่มเดือนใหม่ (มีข้อมูลน้อย), I want เห็นคำเตือนว่าตัวเลขคาดการณ์ยังไม่แม่นยำ so that ฉันไม่เข้าใจผิดว่าเป็นตัวเลขที่แน่นอน
- As a ผู้ใช้, I want เห็นว่าคาดการณ์นี้คำนวณจากอะไร (เช่น "จากอัตราการใช้จ่ายเฉลี่ยต่อวัน") so that ฉันเชื่อถือตัวเลขนี้ได้อย่างมีเหตุผล

### Requirements

**P0 — Must-Have**
- คำนวณ forecast จาก: (รายจ่ายเฉลี่ยต่อวันของงวดปัจจุบัน) × (จำนวนวันที่เหลือในงวด) แล้วหักออกจาก balance ปัจจุบัน — ใช้ field ที่มีอยู่แล้วทั้งหมด (`balance`, `expense`, วันที่ปัจจุบันเทียบกับ period)
- แสดงผลเป็นข้อความ/การ์ดบน Dashboard เช่น "ถ้าใช้จ่ายในเรตนี้ต่อไป สิ้นเดือนคาดว่าจะเหลือ ~3,200.-"
- แสดง disclaimer เมื่อข้อมูลของงวดปัจจุบันยังน้อยเกินไปที่จะ forecast แม่นยำ (เช่น < 5 วันแรกของเดือน)

**Acceptance Criteria**
- [ ] Given อยู่กลางเดือนมีข้อมูลรายจ่ายพอสมควร, When เปิด Dashboard, Then แสดง forecast พร้อมตัวเลขคาดการณ์และคำอธิบายวิธีคิดสั้น ๆ
- [ ] Given เพิ่งขึ้นเดือนใหม่ (< 5 วัน), When เปิด Dashboard, Then แสดง disclaimer ว่าข้อมูลยังน้อย แทนที่จะแสดงตัวเลข forecast ที่มั่นใจเกินจริง
- [ ] Given ไม่มีรายจ่ายเลยในงวดปัจจุบัน, When คำนวณ forecast, Then ไม่ error (หาร 0) และแสดงข้อความที่เหมาะสม
- [ ] Given forecast คาดว่ายอดคงเหลือจะติดลบ, When แสดงผล, Then มีการเน้นสีหรือ tone ที่บ่งบอกความเสี่ยงชัดเจนกว่าปกติ

**P1 — Nice-to-Have**
- แสดง forecast แบบ range (best case / worst case) แทนตัวเลขเดี่ยว
- เปรียบเทียบ forecast กับ Budget Cap (ถ้าทำ A1 แล้ว) ว่าจะเกินวงเงินไหม

**P2 — Future**
- Forecast ที่ปรับตาม seasonality (เช่น รู้ว่าสิ้นเดือนมักมีรายจ่ายบิลก้อนใหญ่)

### Technical Considerations
- Effort ต่ำ-กลาง — logic คำนวณทั้งหมดทำได้ฝั่ง frontend จากข้อมูลที่ `getDashboardStats()` คืนมาอยู่แล้ว ไม่ต้องแตะ Apps Script
- ต้องระวังเรื่อง **การสื่อสารความไม่แน่นอน** — ตัวเลขนี้เป็นการประมาณ ไม่ใช่ความจริง ต้องออกแบบ UI ให้ผู้ใช้ไม่เข้าใจผิดว่าเป็นตัวเลขยืนยัน

---

## A3. Income vs Expense Health Score

### User Stories
- As a ผู้ใช้, I want เห็นสถานะสุขภาพการเงินสรุปเป็นสัญลักษณ์เดียว (🟢🟡🔴) so that ฉันประเมินภาพรวมได้แบบไม่ต้องอ่านตัวเลข
- As a ผู้ใช้, I want รู้ว่าสถานะนี้มาจากอะไร so that ฉันไม่รู้สึกว่าถูกตัดสินโดยไม่มีเหตุผล
- As a ผู้ใช้ใหม่ที่ข้อมูลยังไม่พอ, I want เห็นสถานะ neutral แทนการถูกตัดสินก่อนเวลาอันควร so that ประสบการณ์แรกไม่รู้สึกแย่

### Requirements

**P0 — Must-Have**
- คำนวณ score/status จากอัตราส่วน income:expense เทียบย้อนหลัง (ใช้ field เดิมใน `DashboardStats`) — เกณฑ์แนะนำ: 🟢 Healthy (expense < 80% ของ income), 🟡 Watch (80-100%), 🔴 Overspending (> 100%)
- แสดงเป็น badge/indicator เดี่ยวที่มองเห็นได้ทันทีบน Dashboard (ตำแหน่งควรอยู่ใกล้ mascot จาก v1 เพราะเป็น "หน้าปก" เดียวกัน)
- มีคำอธิบายสั้น ๆ เมื่อกด/แตะดูสถานะ ว่าคำนวณจากอะไร

**Acceptance Criteria**
- [ ] Given expense < 80% ของ income ในงวดปัจจุบัน, When แสดงผล, Then status = 🟢 Healthy
- [ ] Given expense อยู่ระหว่าง 80-100% ของ income, When แสดงผล, Then status = 🟡 Watch
- [ ] Given expense > 100% ของ income, When แสดงผล, Then status = 🔴 Overspending
- [ ] Given ยังไม่มีข้อมูล income ในงวดปัจจุบัน (หาร 0), When คำนวณ, Then แสดงสถานะ neutral ไม่ error และไม่ default เป็น 🔴

**P1 — Nice-to-Have**
- แนวโน้ม status เทียบงวดก่อนหน้า (ดีขึ้น/แย่ลง ไม่ใช่แค่สถานะปัจจุบัน)

**P2 — Future**
- รวม Health Score เข้ากับ Cat Mood Mascot (v1) ให้เป็นตัวขับเคลื่อนเดียวกัน แทนที่จะมี 2 indicator แยกกันที่อาจสื่อสารขัดแย้งกัน — **ควรพิจารณาจุดนี้ตั้งแต่ตอน implement A3** เพราะถ้าปล่อยให้ mascot mood (v1) กับ Health Score (A3) ใช้เกณฑ์คนละแบบ อาจทำให้ผู้ใช้สับสนว่าทำไมแมวยิ้มแต่สถานะเป็นสีแดง

### Technical Considerations
- Effort ต่ำสุดในกลุ่ม Insight — ใช้ข้อมูลเดิมทั้งหมด ไม่ต้องคำนวณอะไรซับซ้อน
- **ความเสี่ยงเรื่อง scope overlap กับ Cat Mood Mascot (v1)** — ทั้งสองฟีเจอร์สรุปสถานะการเงินเป็นภาพเดียว ควรตัดสินใจตั้งแต่แรกว่าจะรวมเป็นตัวเดียวกันหรือแยกกันชัดเจนว่าสื่อสารคนละมิติ (เช่น mascot = อารมณ์เชิงเปรียบเทียบกับเดือนก่อน, Health Score = สถานะ ratio ปัจจุบัน)

---

# กลุ่ม B: ธีมแมว (ต่อยอดจาก v1)

## B1. Savings Goal + หมุดหมายกระปุกแมว

### User Stories
- As a ผู้ใช้, I want ตั้งเป้าหมายจำนวนเงินที่อยากเก็บ so that การออมเงินมีจุดหมายที่จับต้องได้แทนการเก็บแบบไม่มีเป้า
- As a ผู้ใช้, I want เห็นความคืบหน้าไปสู่เป้าหมายเป็นภาพ (กระปุกแมวค่อย ๆ เต็ม) so that ฉันรู้สึกมีแรงจูงใจแบบเห็นภาพชัดกว่าตัวเลข
- As a ผู้ใช้ที่ถึง milestone (25/50/75/100%), I want ได้รับการฉลองเล็ก ๆ so that ความสำเร็จระหว่างทางถูกรับรู้ ไม่ใช่แค่ตอนถึงเป้าหมายสุดท้าย

### Requirements

**P0 — Must-Have**
- เพิ่ม field `savingsGoal` (จำนวนเงินเป้าหมาย) ผูกกับ account ที่มีอยู่แล้ว โดยเฉพาะ account "Savings 🐷" ที่เป็น seed account เดิม — เก็บเป็น entity ใหม่แยก (เช่น `_SavingsGoals: { accountId, targetAmount, createdAt }`) ไม่แก้ schema `Account` เดิม
- หน้า Settings เพิ่มส่วนตั้งเป้าหมายเงินเก็บต่อ account
- แสดงกระปุกแมว (illustration ใหม่ หรือปรับจาก `CatLogo` เดิม) ที่ระดับ "เติม" ตาม % ของ `balance` เทียบ `savingsGoal`
- Milestone celebration ที่ 25/50/75/100%

**Acceptance Criteria**
- [ ] Given ผู้ใช้ตั้งเป้าหมาย 10,000 สำหรับ Savings account, When balance ของ account นั้น = 5,000, Then กระปุกแสดงเติม 50%
- [ ] Given ผู้ใช้ยังไม่ได้ตั้งเป้าหมาย, When เปิดหน้าที่เกี่ยวข้อง, Then ไม่แสดงกระปุก หรือแสดง empty state ชวนตั้งเป้าหมาย
- [ ] Given balance ถึงหรือเกิน savingsGoal, When แสดงผล, Then มีการฉลอง 100% ที่ชัดเจนกว่า milestone ระหว่างทาง
- [ ] Given ผู้ใช้แก้ไขเป้าหมายหลังตั้งไปแล้ว, When บันทึกค่าใหม่, Then กระปุกคำนวณ % ใหม่ทันทีตามเป้าหมายล่าสุด

**P1 — Nice-to-Have**
- ตั้งเป้าหมายได้หลาย account พร้อมกัน (ไม่จำกัดแค่ Savings)
- แสดงประมาณการว่าจะถึงเป้าหมายเมื่อไหร่ตามอัตราการออมปัจจุบัน (เชื่อมกับแนวคิดเดียวกับ Cash Flow Forecast)

**P2 — Future**
- เป้าหมายย่อยหลายระดับในเป้าหมายเดียว (เช่น เก็บเพื่อทริป มีเป้าหมายค่าตั๋ว/ที่พัก/ใช้จ่ายแยกกัน)

### Technical Considerations
- ต้องเพิ่ม entity ใหม่ (คล้าย Budget Cap) แต่ **ไม่จำเป็นต้องแตะ Apps Script backend** ถ้าเลือกเก็บ `savingsGoal` แบบ client-side (เช่น localStorage) แทนการเก็บถาวรใน Sheet — เป็น trade-off ที่ควรตัดสินใจตั้งแต่ต้น: เก็บฝั่ง client (effort ต่ำ แต่ข้อมูลหายถ้าเปลี่ยนเครื่อง/เคลียร์ browser) หรือเก็บฝั่ง Sheet (effort สูงกว่าแต่ถาวรและ sync ข้ามอุปกรณ์ได้เหมือนข้อมูลอื่น)

---

## B2. Achievement / เหรียญตรา

### User Stories
- As a ผู้ใช้, I want ปลดล็อกเหรียญตราเมื่อทำพฤติกรรมการใช้แอปบางอย่างสำเร็จ so that การใช้แอปสม่ำเสมอมีรางวัลที่จับต้องได้
- As a ผู้ใช้, I want เห็นคอลเลกชันเหรียญที่ปลดล็อกแล้วและยังไม่ปลดล็อก so that ฉันมีเป้าหมายให้ไล่เก็บต่อ
- As a ผู้ใช้ที่เพิ่งปลดล็อกเหรียญใหม่, I want เห็นการแจ้งเตือน/ฉลองทันที so that ความสำเร็จถูกรับรู้ในจังหวะที่ใช่

### Requirements

**P0 — Must-Have**
- นิยาม badge เริ่มต้นชุดแรก (แนะนำ 5-8 เหรียญ ไม่ควรเริ่มเยอะเกินไป) อิงจากพฤติกรรมที่วัดได้จากข้อมูลเดิม เช่น:
  - "จดธุรกรรมแรก" (first transaction)
  - "จดครบทุกหมวดรายจ่ายใน 1 เดือน"
  - "Streak 7 วัน" / "Streak 30 วัน" (เชื่อมกับ Logging Streak จาก v1 โดยตรง)
  - "เดือนแรกที่ Health Score เป็น 🟢 Healthy" (ถ้าทำ A3 แล้ว)
- เก็บ state การปลดล็อก badge เป็น entity ใหม่ (เช่น `_UnlockedBadges: { badgeId, unlockedAt }`)
- หน้าแสดงคอลเลกชัน badge (ปลดล็อกแล้ว = เต็มสี, ยังไม่ปลดล็อก = silhouette/เทา) พร้อมเงื่อนไขที่มองเห็นได้ว่าต้องทำอะไรถึงจะได้
- Toast/modal แจ้งเตือนทันทีเมื่อปลดล็อก badge ใหม่

**Acceptance Criteria**
- [ ] Given ผู้ใช้จด transaction แรกในแอป, When บันทึกสำเร็จ, Then ปลดล็อก badge "จดธุรกรรมแรก" ทันทีพร้อมการแจ้งเตือน
- [ ] Given เงื่อนไข badge ยังไม่ครบ, When ผู้ใช้เปิดหน้าคอลเลกชัน, Then badge นั้นแสดงเป็นสถานะ locked พร้อมคำอธิบายเงื่อนไขที่ต้องทำ
- [ ] Given ผู้ใช้ปลดล็อก badge ไปแล้ว, When เข้าเงื่อนไขซ้ำอีกครั้ง (เช่น streak ครบ 7 วันรอบสอง), Then ไม่ปลดล็อกซ้ำหรือแจ้งเตือนซ้ำ (badge ปลดครั้งเดียวถาวร เว้นแต่ออกแบบเป็น repeatable ตั้งแต่แรก)
- [ ] Given badge หลายตัวเข้าเงื่อนไขพร้อมกันในจังหวะเดียว (เช่น จด transaction แรกที่ตรงกับ streak เริ่มต้นด้วย), When ระบบตรวจสอบ, Then แจ้งเตือนทุกตัวโดยไม่ชนกันหรือบัง UI กัน

**P1 — Nice-to-Have**
- Badge tier (บรอนซ์/เงิน/ทอง) สำหรับพฤติกรรมเดียวกันที่ระดับต่างกัน (เช่น streak 7/30/100 วัน เป็น badge เดียวกันคนละ tier)

**P2 — Future**
- Badge ที่เชื่อมกับ Budget Cap/Savings Goal (ถ้าทำ A1/B1 แล้ว) เช่น "ไม่เกินงบ 30 วันติด"
- Social sharing ของ badge collection (นอก scope v2 ตาม Non-Goals)

### Technical Considerations
- **Effort สูงสุดในกลุ่มธีมแมวทั้งหมด** — ต้องออกแบบ badge condition engine ที่ตรวจสอบเงื่อนไขหลายแบบ (some ใช้ transaction count, some ใช้ streak, some ใช้ ratio) ไม่ใช่ logic เดียวที่ reuse ได้ง่าย ๆ
- ควรออกแบบ badge condition เป็น config-driven (เช่น array ของ `{id, condition: fn, unlockedCheck: fn}`) ตั้งแต่แรก เพื่อให้เพิ่ม badge ใหม่ในอนาคตไม่ต้องแก้ core logic ซ้ำ — ตรงกับสิ่งที่ v1 ระบุไว้ใน Future Considerations ว่า "ออกแบบให้ mascot state และ streak logic รองรับการเพิ่ม badge ในอนาคตได้ง่าย"
- ต้องตัดสินใจเรื่องที่เก็บข้อมูล (client-side vs Sheet) เหมือน B1

---

## B3. Monthly Wrap-up แบบแชร์ได้

### User Stories
- As a ผู้ใช้, I want เห็นสรุปการเงินรายเดือนในรูปแบบการ์ดสวยงามธีมแมว so that การดูสรุปเดือนรู้สึกสนุกกว่าการอ่านตัวเลขในตาราง
- As a ผู้ใช้, I want บันทึก/แคปการ์ดนี้ไปแชร์ได้ so that ฉันแบ่งปันความสำเร็จทางการเงินกับคนอื่นได้ถ้าอยากทำ
- As a ผู้ใช้ที่เดือนนั้นไม่มีข้อมูลเพียงพอ, I want ไม่เห็นการ์ดที่ดูว่างเปล่าหรือแปลก so that ประสบการณ์ยังคงดูเป็นมืออาชีพ

### Requirements

**P0 — Must-Have**
- สร้างหน้า/modal "Monthly Wrap-up" เข้าถึงได้เมื่อขึ้นเดือนใหม่ หรือกดดูย้อนหลังได้จาก Dashboard
- ดึงข้อมูลจาก `DashboardStats` ของงวดที่ผ่านมา (income, expense, top category, balance change) มาจัดวางเป็นการ์ดภาพสไตล์ธีมแมว พร้อมข้อความเชิงเปรียบเทียบสนุก ๆ (เช่น "เดือนนี้ประหยัดได้เท่ากับ 12 มื้อข้าวแมวเปียก 🐟")
- ปุ่ม/ฟังก์ชันบันทึกการ์ดเป็นรูปภาพ (image export) ให้ผู้ใช้เอาไปแชร์เองนอกแอป

**Acceptance Criteria**
- [ ] Given งวดที่ผ่านมามีข้อมูลครบ, When เปิด Monthly Wrap-up, Then แสดงการ์ดพร้อมตัวเลขสรุปที่ถูกต้องตรงกับ Dashboard
- [ ] Given งวดที่ผ่านมาไม่มี transaction เลย, When เปิดดู, Then แสดงข้อความที่เหมาะสม (เช่น ชวนกลับมาจด) แทนการ์ดตัวเลขว่างเปล่า
- [ ] Given ผู้ใช้กดบันทึกการ์ด, When ดำเนินการ, Then ได้ไฟล์ภาพที่มีข้อมูลครบถ้วนอ่านได้ชัดเจน ไม่ตัดขอบ/overflow
- [ ] Given ตัวเลขในการ์ด (เช่น "เท่ากับ N มื้อข้าวแมวเปียก"), When คำนวณ, Then มาจากค่าคงที่ที่กำหนดไว้ชัดเจนในโค้ด ไม่ใช่ตัวเลขสุ่มที่เปลี่ยนไปมาแต่ละครั้งที่เปิดดู

**P1 — Nice-to-Have**
- เทียบสรุปเดือนนี้กับเดือนก่อนแบบเห็นภาพ (กราฟเล็ก ๆ ในการ์ด)
- เลือกดู wrap-up ของเดือนย้อนหลังได้ (ไม่ใช่แค่เดือนล่าสุด)

**P2 — Future**
- Auto-generate และแจ้งเตือนอัตโนมัติทุกต้นเดือน (ต้องมี notification system ก่อน อยู่นอก scope ปัจจุบัน)
- Direct share ไปยัง social platform โดยไม่ต้องแคปเอง (ต้องมี share API integration)

### Technical Considerations
- Effort กลาง — logic ข้อมูลใช้ของเดิมได้เกือบหมด แต่งานหลักคือ **design/frontend** สำหรับ layout การ์ดที่สวยงามและ export เป็นภาพได้ถูกต้อง (ต้องเลือก library สำหรับ HTML-to-image เช่น `html2canvas` หรือแนวทางเทียบเท่า)
- ควรทำ **หลัง** B1/B2 เพราะการ์ดสรุปที่ดีที่สุดคือการ์ดที่รวม signal จากฟีเจอร์อื่น (เช่น badge ที่ได้ในเดือนนั้น, ความคืบหน้า savings goal) — ถ้าทำ B3 ก่อน จะได้แค่การ์ดตัวเลขล้วนที่ไม่ต่างจาก Dashboard เดิมมากนัก

---

## Success Metrics (v2 เพิ่มเติมจาก v1)

### Leading Indicators
- **Budget Cap adoption** — จำนวนหมวดหมู่ที่ตั้งวงเงินไว้ เทียบกับจำนวนหมวดที่ใช้งานจริง
- **Savings Goal ถูกตั้งและมี progress เพิ่มขึ้นต่อเนื่อง** — ไม่ใช่แค่ตั้งครั้งเดียวแล้วไม่กลับมาดู
- **Badge unlock rate** — จำนวน badge ที่ปลดล็อกได้ภายใน 30 วันแรกหลัง launch
- **Monthly Wrap-up ถูกเปิดดูทุกเดือน** — วัดว่าเป็นพฤติกรรมที่ผู้ใช้กลับมาทำซ้ำหรือดูครั้งเดียวแล้วเลิก

### Lagging Indicators
- **Cash Flow Forecast ความแม่นยำ** — เทียบตัวเลขคาดการณ์กับยอดจริงตอนสิ้นเดือน (ควรอยู่ในช่วงคลาดเคลื่อนที่ยอมรับได้ เพื่อสร้างความเชื่อถือ)
- **Health Score กับพฤติกรรมจริง** — ผู้ใช้ที่เห็นสถานะ 🔴 ต่อเนื่อง มีการปรับพฤติกรรม (expense ลดลง) ในงวดถัดไปหรือไม่

> หมายเหตุเดียวกับ v1: เนื่องจากเป็นแอป single-user ให้ใช้ metric เชิงพฤติกรรมของผู้ใช้จริงเป็นหลักในเฟสนี้

## Open Questions

- **[Product]** Budget Cap (A1) กับ Health Score (A3) กับ Anomaly Alert (v1) มีความซ้ำซ้อนเชิง concept ระดับหนึ่ง (ทั้งหมดคือ "บอกว่าใช้จ่ายเยอะไป") — ควรออกแบบให้ 3 ฟีเจอร์นี้สื่อสารกันเป็นระบบเดียว หรือปล่อยแยกกันแล้วให้ผู้ใช้เลือกเปิดใช้เฉพาะที่ต้องการ?
- **[Engineering]** B1/B2 ควรเก็บข้อมูลฝั่ง client (localStorage) หรือฝั่ง Google Sheet? กระทบทั้ง effort และ reliability ข้ามอุปกรณ์ — ควรตัดสินใจเป็นนโยบายเดียวกันทั้งสองฟีเจอร์ ไม่ใช่ต่างกันแต่ละตัว
- **[Design]** Cat Mood Mascot (v1) กับ Health Score (A3) ควรรวมเป็น indicator เดียวหรือแยกกัน — ตามที่ระบุใน A3 Technical Considerations
- **[Product]** Badge ชุดแรก (B2) ควรมีกี่เหรียญและเงื่อนไขอะไรบ้าง — ต้อง finalize ก่อนเริ่ม design asset เพราะกระทบทั้ง engineering effort และ illustration work

## Timeline Considerations

- ไม่มี hard deadline — เช่นเดียวกับ v1
- **แนะนำลำดับ implement** (ประเมินจาก effort และ dependency):
  1. **A3 Health Score** — effort ต่ำสุด แต่ต้องตัดสินใจเรื่อง overlap กับ mascot ก่อนเริ่ม
  2. **A2 Cash Flow Forecast** — effort ต่ำ-กลาง ไม่ต้องแตะ backend
  3. **B1 Savings Goal** — effort กลาง ต้องตัดสินใจเรื่องที่เก็บข้อมูลก่อนเริ่ม
  4. **B2 Achievement Badge** — ควรทำหลัง B1 เพราะ badge ชุดแรกอ้างอิง streak (v1) และควรอ้างอิง savings goal (B1) ด้วยถ้าเป็นไปได้
  5. **B3 Monthly Wrap-up** — ควรทำหลัง B1/B2 ตามที่ระบุใน Technical Considerations เพื่อให้การ์ดสรุปมีเนื้อหาสมบูรณ์
  6. **A1 Budget Cap** — effort สูงสุดและเป็นตัวเดียวที่ต้องแตะ Apps Script backend จริงจัง แนะนำทำเป็นตัวสุดท้ายหรือแยกเป็น sprint ของตัวเอง
- **A1 (Budget Cap)** ควรวางแผนแยกจาก 5 ฟีเจอร์ที่เหลือ เพราะเป็นตัวเดียวที่กระทบ backend/deployment process (ต้อง manual GAS redeploy ตามที่ project overview ระบุไว้) — ฟีเจอร์อื่นทั้งหมดยัง deploy ผ่าน Vercel auto-deploy ได้ตามปกติ

---

*เอกสารนี้จัดทำโดย Minju สำหรับ P'Earth — ครอบคลุมฟีเจอร์ที่เหลือทั้งหมดจากการ brainstorm กลุ่ม Insight และธีมแมว พร้อมส่งต่อให้ทีม Dev วางแผน sprint ต่อจาก v1 ได้เลยค่ะ*
