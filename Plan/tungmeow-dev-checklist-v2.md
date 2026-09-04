# TungMeow — Dev Completion Checklist
## Insight Analytics + Cat Companion (v2)

อ้างอิงจาก: `PRD-insight-cat-features-v2-remaining.md`
ใช้เช็คว่าทีม Dev ทำครบตาม spec ก่อนถือว่าฟีเจอร์เสร็จ — ไม่ใช่ task breakdown สำหรับวางแผนงาน

---

## 🔍 กลุ่ม Insight

### A1. Budget Cap เตือนใกล้เกิน

**Data Model / Backend** ⚠️ ตัวเดียวใน v2 ที่แตะ Apps Script backend จริงจัง
- [ ] เพิ่ม sheet tab ใหม่ `_BudgetCaps` แยกจาก transaction data เดิม — ไม่แก้ schema เดิม
- [ ] เพิ่ม action ใหม่ใน `Router.gs` (เช่น `getBudgetCaps`, `setBudgetCap`)
- [ ] ใช้ fixed category list เดิมจาก `Categories.gs` ไม่สร้าง category list ใหม่ซ้ำซ้อน

**UI**
- [ ] หน้า Settings เพิ่มส่วนตั้งค่า Budget Cap ต่อหมวดหมู่
- [ ] Dashboard แสดง progress bar ต่อหมวดที่ตั้งวงเงินไว้เท่านั้น (ไม่บังคับแสดงหมวดที่ไม่ได้ตั้ง)
- [ ] สถานะสี: เขียว (< 80%) / เหลือง (80–100%) / แดง (> 100%)

**Acceptance Criteria**
- [ ] ตั้งวงเงินหมวด Food 5,000 + ใช้ไป 4,200 → progress bar = 84% สีเหลือง
- [ ] ไม่ได้ตั้งวงเงินหมวดใดเลย → ไม่แสดง progress bar เลย ไม่ error
- [ ] รายจ่ายเกินวงเงิน 100% → สถานะแดง + ข้อความบอกเกินไปเท่าไหร่
- [ ] แก้ไขวงเงินระหว่างเดือน → คำนวณใหม่ทันที ไม่ retroactive เปลี่ยนข้อมูลเก่า

**Deployment**
- [ ] ⚠️ ต้อง **manual GAS redeploy** ตาม `gas/DEPLOYMENT.md` — ต่างจากฟีเจอร์อื่นใน v2 ทั้งหมด แจ้งทีมล่วงหน้า
- [ ] แนะนำแยกเป็น sprint ของตัวเอง ไม่รวมกับ 5 ฟีเจอร์ frontend-only

---

### A2. Cash Flow Forecast

**Logic**
- [ ] คำนวณจาก (รายจ่ายเฉลี่ยต่อวันของงวดปัจจุบัน) × (วันที่เหลือในงวด) หักจาก balance ปัจจุบัน — ใช้ field เดิมทั้งหมด ไม่แตะ backend
- [ ] มี disclaimer เมื่อข้อมูลงวดปัจจุบันยังน้อย (แนะนำ < 5 วันแรกของเดือน)

**Acceptance Criteria**
- [ ] กลางเดือน มีข้อมูลพอสมควร → แสดง forecast พร้อมคำอธิบายวิธีคิดสั้น ๆ
- [ ] เพิ่งขึ้นเดือนใหม่ (< 5 วัน) → แสดง disclaimer แทนตัวเลขที่มั่นใจเกินจริง
- [ ] ไม่มีรายจ่ายเลยในงวดปัจจุบัน → ไม่ error (หาร 0), แสดงข้อความเหมาะสม
- [ ] Forecast คาดว่ายอดคงเหลือติดลบ → เน้นสี/tone ความเสี่ยงชัดเจนกว่าปกติ

**UX/Content**
- [ ] ข้อความสื่อสารชัดเจนว่าเป็น "การประมาณ" ไม่ใช่ตัวเลขยืนยัน — ตรวจสอบว่า UI ไม่ทำให้เข้าใจผิด

---

### A3. Income vs Expense Health Score

**Logic**
- [ ] คำนวณจากอัตราส่วน expense:income เทียบย้อนหลัง ใช้ field เดิมใน `DashboardStats`
- [ ] เกณฑ์: 🟢 Healthy (< 80%) / 🟡 Watch (80–100%) / 🔴 Overspending (> 100%)

**Acceptance Criteria**
- [ ] expense < 80% ของ income → 🟢 Healthy
- [ ] expense 80–100% ของ income → 🟡 Watch
- [ ] expense > 100% ของ income → 🔴 Overspending
- [ ] ยังไม่มีข้อมูล income ในงวดปัจจุบัน (หาร 0) → แสดง neutral ไม่ error ไม่ default เป็น 🔴

**⚠️ ต้องตัดสินใจก่อนเริ่ม (Open Question จาก PRD)**
- [ ] Health Score กับ Cat Mood Mascot (v1) รวมเป็น indicator เดียวหรือแยกกัน — **ตัดสินใจแล้วก่อนเริ่ม implement**
- [ ] ถ้าแยกกัน: ตรวจสอบว่าเกณฑ์ทั้งสองไม่ส่งสัญญาณขัดแย้งกัน (เช่น แมวยิ้มแต่ status สีแดง)

---

## 🐱 กลุ่มธีมแมว

### B1. Savings Goal + หมุดหมายกระปุกแมว

**Data Model**
- [ ] ตัดสินใจแล้วว่าเก็บ `savingsGoal` ฝั่ง client (localStorage) หรือฝั่ง Sheet (entity ใหม่ `_SavingsGoals`) — **เป็น Open Question ที่ต้องปิดก่อนเริ่ม**
- [ ] ผูกกับ account ที่มีอยู่แล้ว ไม่แก้ schema `Account` เดิม

**UI**
- [ ] หน้า Settings เพิ่มส่วนตั้งเป้าหมายเงินเก็บต่อ account
- [ ] กระปุกแมวแสดงระดับ "เติม" ตาม % ของ balance เทียบ savingsGoal
- [ ] Milestone celebration ที่ 25/50/75/100%

**Acceptance Criteria**
- [ ] ตั้งเป้าหมาย 10,000 + balance = 5,000 → กระปุกแสดง 50%
- [ ] ยังไม่ได้ตั้งเป้าหมาย → ไม่แสดงกระปุก หรือ empty state ชวนตั้งเป้าหมาย
- [ ] balance ถึง/เกิน savingsGoal → ฉลอง 100% ชัดเจนกว่า milestone ระหว่างทาง
- [ ] แก้ไขเป้าหมายหลังตั้งแล้ว → คำนวณ % ใหม่ทันทีตามเป้าหมายล่าสุด

---

### B2. Achievement / เหรียญตรา

**⚠️ ต้องตัดสินใจก่อนเริ่ม implement**
- [ ] Finalize badge ชุดแรก (แนะนำ 5-8 เหรียญ) — เงื่อนไขต้องชัดก่อนเริ่ม design asset
- [ ] ตัดสินใจที่เก็บข้อมูล (client-side vs Sheet) — ควรเป็นนโยบายเดียวกับ B1 ไม่ใช่ต่างกันคนละแบบ

**Architecture**
- [ ] ออกแบบ badge condition เป็น config-driven (เช่น array ของ `{id, condition, unlockedCheck}`) ไม่ hardcode logic แยกแต่ละเหรียญ — เพื่อให้เพิ่ม badge ใหม่ในอนาคตไม่ต้องแก้ core logic ซ้ำ
- [ ] เก็บ state ปลดล็อกเป็น entity ใหม่ (เช่น `_UnlockedBadges: { badgeId, unlockedAt }`)
- [ ] badge ที่อ้างอิง Logging Streak (v1) เชื่อมกับ streak logic เดิมโดยตรง ไม่คำนวณ streak ซ้ำ

**UI**
- [ ] หน้าคอลเลกชัน badge: ปลดล็อกแล้ว = เต็มสี, ยังไม่ปลดล็อก = silhouette/เทา พร้อมเงื่อนไขที่มองเห็นได้
- [ ] Toast/modal แจ้งเตือนทันทีเมื่อปลดล็อก badge ใหม่

**Acceptance Criteria**
- [ ] จด transaction แรกในแอป → ปลดล็อก badge "จดธุรกรรมแรก" ทันทีพร้อมแจ้งเตือน
- [ ] เงื่อนไข badge ยังไม่ครบ → แสดง locked พร้อมคำอธิบายเงื่อนไข
- [ ] ปลดล็อกไปแล้ว + เข้าเงื่อนไขซ้ำ (เช่น streak ครบ 7 วันรอบสอง) → ไม่ปลดล็อกซ้ำ/แจ้งเตือนซ้ำ (เว้นแต่ออกแบบเป็น repeatable ตั้งแต่แรก)
- [ ] หลาย badge เข้าเงื่อนไขพร้อมกัน → แจ้งเตือนครบทุกตัว ไม่ชนกันหรือบัง UI กัน

---

### B3. Monthly Wrap-up แบบแชร์ได้

**ควรทำหลัง B1/B2** (ตามลำดับที่ PRD แนะนำ) เพื่อให้การ์ดมีเนื้อหาจาก badge/savings goal ไม่ใช่แค่ตัวเลข dashboard ซ้ำ

**Logic**
- [ ] ดึงข้อมูลจาก `DashboardStats` ของงวดที่ผ่านมา — ไม่คำนวณ stat ใหม่ซ้ำซ้อน
- [ ] ค่าคงที่เชิงเปรียบเทียบ (เช่น "เท่ากับ N มื้อข้าวแมวเปียก") กำหนดตายตัวในโค้ด ไม่ใช่ค่าสุ่ม

**UI**
- [ ] หน้า/modal Monthly Wrap-up เข้าถึงได้จาก Dashboard หรือตอนขึ้นเดือนใหม่
- [ ] ปุ่มบันทึกการ์ดเป็นรูปภาพ (เลือก library เช่น `html2canvas` แล้วบันทึกไว้)

**Acceptance Criteria**
- [ ] งวดที่ผ่านมามีข้อมูลครบ → การ์ดแสดงตัวเลขตรงกับ Dashboard
- [ ] งวดที่ผ่านมาไม่มี transaction เลย → ข้อความเหมาะสม (ชวนกลับมาจด) ไม่ใช่การ์ดว่างเปล่า
- [ ] กดบันทึกการ์ด → ได้ไฟล์ภาพครบถ้วน อ่านชัดเจน ไม่ตัดขอบ/overflow

---

## ✅ Cross-cutting (เช็คทุกฟีเจอร์รวมกัน)

**Non-Goals — ต้องไม่มีสิ่งเหล่านี้เกิดขึ้นโดยไม่ตั้งใจ**
- [ ] ไม่มีการเรียก AI/LLM ใด ๆ ปนเข้ามาใน 6 ฟีเจอร์นี้
- [ ] ไม่มี multi-user / shared budget ใด ๆ (Budget Cap, Savings Goal ยังเป็น single-user)
- [ ] ไม่มี push notification จริงออกนอกแอป (Budget Cap alert, Badge unlock เป็น in-app only)
- [ ] Badge system ไม่เชื่อมกับระบบภายนอก (social sharing, leaderboard)
- [ ] Monthly Wrap-up ไม่ทำ auto-post/share API — export ภาพให้ผู้ใช้แคปเองเท่านั้น
- [ ] Data model เดิมของ Transaction/Account ไม่ถูกแก้ — entity ใหม่ (BudgetCap, SavingsGoal, Badge) แยกต่างหากเสมอ

**Deployment**
- [ ] 5 ฟีเจอร์ (A2, A3, B1, B2, B3) deploy ผ่าน Vercel auto-deploy ปกติได้ — ไม่ต้อง manual GAS redeploy
- [ ] A1 (Budget Cap) เท่านั้นที่ต้อง manual GAS redeploy — วางแผนแยก
- [ ] `npm run build` และ `npm run lint` ผ่านก่อน merge ทุก PR

**QA**
- [ ] ทดสอบ empty state ของทั้ง 6 ฟีเจอร์ (ผู้ใช้ยังไม่ได้ตั้งค่า/ไม่มีข้อมูลพอ)
- [ ] ทดสอบผ่าน mock data service ก่อน เทียบกับ real Apps Script backend อีกรอบ (โดยเฉพาะ A1)
- [ ] อัปเดต Playwright smoke check ใน `qa-screens/` ให้ครอบคลุมหน้า/component ใหม่

**Open Questions ที่ต้องปิดก่อน "เสร็จจริง"**
- [ ] [Product] Budget Cap (A1) / Health Score (A3) / Anomaly Alert (v1) ออกแบบให้สื่อสารกันเป็นระบบเดียว หรือแยกกันชัดเจน — ตัดสินใจแล้ว
- [ ] [Engineering] B1/B2 เก็บข้อมูล client-side หรือ Sheet — ตัดสินใจแล้วเป็นนโยบายเดียวกันทั้งคู่
- [ ] [Design] Cat Mood Mascot (v1) กับ Health Score (A3) รวมหรือแยก indicator — ตัดสินใจแล้ว
- [ ] [Product] Badge ชุดแรก (B2) จำนวนและเงื่อนไข — finalize แล้วก่อนเริ่ม design asset

**ลำดับ Implement ที่แนะนำ** (จาก PRD v2 — อ้างอิงเทียบงานจริง)
- [ ] 1. A3 Health Score
- [ ] 2. A2 Cash Flow Forecast
- [ ] 3. B1 Savings Goal
- [ ] 4. B2 Achievement Badge
- [ ] 5. B3 Monthly Wrap-up
- [ ] 6. A1 Budget Cap (สุดท้าย/แยก sprint เพราะแตะ backend)

---

*Checklist นี้จัดทำโดย Minju สำหรับ P'Earth เพื่อให้ทีม Dev เช็คงานเทียบกับ PRD v2 — ติ๊กครบทุกข้อถึงจะถือว่า release พร้อมส่งมอบค่ะ 🐾*
