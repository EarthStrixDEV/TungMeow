# TungMeow — Apps Script Backend Deployment Guide

คู่มือนี้เขียนไว้ให้พี่เอิร์ธทำเองทีละขั้นตอนในเบราว์เซอร์ ล็อกอินด้วย `warapon.jitsook@gmail.com` ค่ะ ไม่ต้องมีพื้นฐาน Apps Script มาก่อนก็ทำตามได้เลย ทำตามลำดับ 1 → 8 ห้ามข้ามค่ะ

---

## 1. สร้าง Google Sheet

1. เปิด https://sheets.google.com
2. คลิก **Blank** (หรือเครื่องหมาย `+`) เพื่อสร้างสเปรดชีตใหม่
3. คลิกชื่อไฟล์ "Untitled spreadsheet" ที่มุมซ้ายบน ลบทิ้งแล้วพิมพ์ชื่อนี้ **เป๊ะๆ**:
   ```
   TungMeow Ledger 2026
   ```
4. กด Enter เพื่อยืนยันชื่อ

### หา Sheet ID

ดูที่ URL บนแถบที่อยู่ของเบราว์เซอร์ จะมีหน้าตาแบบนี้:

```
https://docs.google.com/spreadsheets/d/1AbCDefGhIJkLmnOPQRstuVWXyz1234567890abcd/edit
```

ส่วนที่อยู่ระหว่าง `/d/` กับ `/edit` คือ **Sheet ID** ของพี่เอิร์ธ (ในตัวอย่างคือ `1AbCDefGhIJkLmnOPQRstuVWXyz1234567890abcd`) — คัดลอกเก็บไว้ก่อน จะใช้ในขั้นตอนที่ 4 ค่ะ

---

## 2. เปิด Apps Script editor (ผูกกับ Sheet นี้)

1. อยู่ในหน้า Sheet ที่เพิ่งสร้าง ไปที่เมนู **Extensions → Apps Script**
2. หน้าต่างใหม่จะเปิดขึ้น (Apps Script editor) พร้อมโปรเจกต์ที่ผูกกับ Sheet นี้อัตโนมัติ
3. คลิกชื่อโปรเจกต์ "Untitled project" ที่มุมซ้ายบน (ข้างโลโก้ Apps Script) แล้วเปลี่ยนเป็น:
   ```
   TungMeow Backend
   ```
4. คลิก **Rename** เพื่อยืนยัน

---

## 3. วางโค้ดทั้ง 8 ไฟล์

โปรเจกต์ใหม่จะมีไฟล์เดียวชื่อ `Code.gs` มีโค้ด stub `function myFunction() {}` อยู่ในนั้น เราจะแทนที่เนื้อหาทั้งหมดและเพิ่มไฟล์ที่เหลือ

> ⚠️ **สำคัญ:** ตอนตั้งชื่อไฟล์ใหม่ใน Apps Script **ห้ามพิมพ์ `.gs` ต่อท้าย** — ระบบเติมให้เองอัตโนมัติ ถ้าพิมพ์ `.gs` ซ้ำจะได้ไฟล์ชื่อ `Router.gs.gs` ผิด

### 3.1 ไฟล์ `Code.gs` (ไฟล์ที่มีอยู่แล้ว)

1. คลิกไฟล์ `Code.gs` ในแถบ **Files** ทางซ้าย
2. เลือกโค้ด stub ทั้งหมดในตัว editor (Ctrl+A) แล้วลบทิ้ง
3. เปิดไฟล์ `D:\My Second Brain\Project Dev\MeowTung\gas\Code.gs` บนเครื่องพี่เอิร์ธ คัดลอกเนื้อหาทั้งหมด แล้ววางแทนที่ในตัว editor

### 3.2 ไฟล์ที่เหลือ 7 ไฟล์: `Router.gs`, `Utils.gs`, `Auth.gs`, `Cache.gs`, `Periods.gs`, `Categories.gs`, `SheetService.gs`

สำหรับแต่ละไฟล์ ทำซ้ำขั้นตอนนี้ (รวม 7 ไฟล์):

1. คลิกเครื่องหมาย **`+`** ข้างหัวข้อ **Files** ทางซ้าย
2. เลือก **Script**
3. พิมพ์ชื่อไฟล์ **ไม่ต้องมี `.gs`** เช่นพิมพ์แค่ `Router` (ระบบจะแสดงเป็น `Router.gs` เอง) — ต้องตรงกับชื่อไฟล์เป๊ะๆ (ตัวพิมพ์เล็ก-ใหญ่ต้องตรง):
   - `Router`
   - `Utils`
   - `Auth`
   - `Cache`
   - `Periods`
   - `Categories`
   - `SheetService`
4. กด Enter เพื่อสร้างไฟล์
5. ลบโค้ด default ที่ขึ้นมา (ถ้ามี) แล้วเปิดไฟล์ต้นฉบับที่ตรงกันจาก `D:\My Second Brain\Project Dev\MeowTung\gas\` (เช่น `Router.gs`) คัดลอกเนื้อหาทั้งหมด วางลงในไฟล์ที่สร้างใหม่นี้

ทำจนครบทั้ง 7 ไฟล์ค่ะ

### 3.3 ไฟล์ manifest `appsscript.json`

ไฟล์นี้ Apps Script ซ่อนไว้โดยดีฟอลต์ ต้องเปิดให้แสดงก่อน:

1. คลิกไอคอนรูปเฟือง **Project Settings** (แถบซ้ายสุด)
2. เลื่อนลงไปหาส่วน **General settings**
3. ติ๊กเครื่องหมายถูกที่ **Show "appsscript.json" manifest file in editor**
4. กลับไปที่ไอคอน **Editor** (แถบซ้ายสุด, ไอคอนรูป `< >`) จะเห็นไฟล์ `appsscript.json` โผล่มาในรายการ **Files** แล้ว
5. คลิกเปิดไฟล์นั้น ลบเนื้อหาเดิมทั้งหมด
6. เปิดไฟล์ `D:\My Second Brain\Project Dev\MeowTung\gas\appsscript.json` บนเครื่องพี่เอิร์ธ คัดลอกเนื้อหาทั้งหมด วางแทนที่

### 3.4 บันทึก

กด **Ctrl+S** (หรือคลิกไอคอนรูปแผ่นดิสก์ที่แถบด้านบน) เพื่อบันทึกทุกไฟล์พร้อมกัน

---

## 4. ตั้งค่า Script Properties

1. คลิกไอคอนรูปเฟือง **Project Settings** (แถบซ้ายสุด)
2. เลื่อนลงไปหาส่วน **Script Properties**
3. คลิก **Add script property**
4. เพิ่มค่าที่ 1:
   - **Property**: `SHEET_ID`
   - **Value**: Sheet ID ที่คัดลอกไว้จากขั้นตอนที่ 1
5. คลิก **Add script property** อีกครั้งเพื่อเพิ่มค่าที่ 2:
   - **Property**: `API_TOKEN`
   - **Value**: ดูวิธีสร้างค่านี้ด้านล่าง

### วิธีสร้าง `API_TOKEN`

**วิธีง่ายสุด (แนะนำ):** ค่านี้แค่ต้องเดายาก ไม่ต้องเป็นอะไรพิเศษทางเทคนิค — พิมพ์มั่วๆ บนคีย์บอร์ดยาวๆ อย่างน้อย 32 ตัวอักษร ผสมตัวอักษรพิมพ์เล็ก-ใหญ่และตัวเลข เช่น:
```
xK9mP2vQzR7wL4nT8jY3hF6cB1dS5gA0
```
(อย่าใช้ตัวอย่างนี้ตรงๆ นะคะ พิมพ์มั่วเองใหม่จะปลอดภัยกว่า) พิมพ์ค่าที่สร้างเองลงในช่อง **Value** ได้เลยค่ะ

**วิธีทางเลือก (ถ้าอยากได้ค่าที่ดูเป็นระเบียบกว่า):**
1. กลับไปที่ไอคอน **Editor** เปิดไฟล์ `Code.gs`
2. เพิ่มฟังก์ชันชั่วคราวนี้ต่อท้ายไฟล์ (วางที่ไหนก็ได้ในไฟล์):
   ```js
   function tempGenerateToken() {
     Logger.log(Utilities.getUuid());
   }
   ```
3. บันทึก (Ctrl+S)
4. ที่แถบด้านบน ข้าง Debug จะมี dropdown เลือกฟังก์ชัน — เลือก `tempGenerateToken`
5. คลิก **Run**
6. เปิด **Execution log** (ดูวิธีในขั้นตอนที่ 5 ด้านล่าง) จะเห็นค่า UUID เช่น `550e8400-e29b-41d4-a716-446655440000` — คัดลอกค่านี้ไปใส่ในช่อง **Value** ของ `API_TOKEN`
7. ลบฟังก์ชัน `tempGenerateToken` ออกจาก `Code.gs` แล้วบันทึกอีกครั้ง (ไม่จำเป็นต้องเก็บไว้)

6. หลังกรอกครบทั้ง 2 ค่า คลิก **Save script properties**

---

## 5. รัน `setupSheet()` ครั้งเดียว

1. กลับไปที่ไอคอน **Editor** เปิดไฟล์ `Code.gs`
2. ที่แถบเครื่องมือด้านบน จะมี dropdown เลือกฟังก์ชัน (อยู่ข้าง ๆ ปุ่ม **Debug**) — คลิกแล้วเลือก `setupSheet`
3. คลิกปุ่ม **Run**

### หน้าจอขออนุญาต (OAuth authorization)

ครั้งแรกที่รัน จะเจอหน้าจอขออนุญาตแบบนี้:

> ⚠️ **หน้าจอ "Google hasn't verified this app" คืออะไร:** เพราะนี่คือสคริปต์ส่วนตัวของพี่เอิร์ธเอง ไม่ได้ส่งให้ Google ตรวจสอบ/เผยแพร่สาธารณะ (ไม่ใช่แอปที่แจกให้คนอื่นใช้) จึงเป็นเรื่องปกติที่ Google จะเตือนแบบนี้ ไม่ใช่สัญญาณอันตรายค่ะ

คลิกตามลำดับนี้:
1. หน้าต่าง popup "Authorization required" → คลิก **Review permissions** (หรือ **Continue**)
2. เลือกบัญชี `warapon.jitsook@gmail.com`
3. หน้าจอ "Google hasn't verified this app" → คลิก **Advanced** (มุมซ้ายล่าง)
4. จะเห็นลิงก์ "Go to TungMeow Backend (unsafe)" โผล่ขึ้นมา → คลิกลิงก์นั้น
5. หน้าจอสรุปสิทธิ์ที่สคริปต์ขอ → เลื่อนลงล่างสุด คลิก **Allow**

> หมายเหตุ: ป้ายกำกับปุ่มด้านบน (เช่น "Go to {project} (unsafe)", "Advanced") อ้างอิงจาก UI ของ Google ในช่วงที่ผ่านมา — Google อาจปรับถ้อยคำเล็กน้อยเป็นครั้งคราว ถ้าเจอข้อความไม่ตรงเป๊ะ ให้มองหาปุ่ม/ลิงก์ที่ความหมายใกล้เคียงกัน (เช่น ลิงก์เล็กๆ ที่นำไปสู่การอนุญาตสคริปต์ที่ยังไม่ผ่านการตรวจสอบ)

### ตรวจสอบว่าสำเร็จ

**วิธีที่ 1 — เช็ค Execution log:**
1. ไปที่เมนู **View → Executions** (หรือคลิกไอคอนรูปนาฬิกา/ประวัติทางแถบซ้าย ชื่อ **Executions**)
2. คลิกรายการ execution ล่าสุดของ `setupSheet`
3. ควรเห็น log บรรทัดที่ขึ้นต้นด้วย `setupSheet done. Account tabs created: [Cash, Bank_KBank, Credit_Card, Savings]. ...`

**วิธีที่ 2 — เปิด Sheet จริงดู:**
เปิดแท็บ Google Sheet ที่สร้างไว้ในขั้นตอนที่ 1 (รีเฟรชถ้าเปิดค้างอยู่) ควรเห็น:
- แท็บ 4 อัน: `Cash`, `Bank_KBank`, `Credit_Card`, `Savings` — แต่ละแท็บมี header row A-F (Date/Description/Category/Type/Amount/Note) ตัวหนา
- แท็บที่ 5 ชื่อ `_TungMeow_Meta` จะ**ไม่โชว์**ในแถบแท็บล่าง เพราะถูกซ่อนไว้ — เช็คได้โดยคลิกขวาที่แถบแท็บล่างสุด แล้วดูว่ามีตัวเลือก "Unhide sheet" หรือคลิกลูกศร dropdown เล็กๆ ที่มุมล่างซ้ายของหน้าจอ Sheet จะเห็นรายชื่อแท็บที่ซ่อนอยู่ รวมถึง `_TungMeow_Meta`

---

## 6. Deploy เป็น Web App

1. คลิกปุ่ม **Deploy** (มุมขวาบนของ Apps Script editor)
2. เลือก **New deployment**
3. คลิกไอคอนรูปเฟืองข้างคำว่า "Select type" แล้วเลือก **Web app**
4. กรอกฟอร์ม:
   - **Description**: พิมพ์อะไรก็ได้ เช่น `TungMeow backend v1`
   - **Execute as**: เลือก **Me (warapon.jitsook@gmail.com)**
   - **Who has access**: เลือก **Anyone**
5. คลิก **Deploy**
6. ถ้ามีหน้าจอขออนุญาตอีกรอบ ให้ทำซ้ำขั้นตอน authorize เหมือนข้อ 5 ด้านบน (Advanced → Go to ... (unsafe) → Allow)
7. หลัง deploy สำเร็จ จะเห็น **Web app URL** ขึ้นมา หน้าตาแบบ:
   ```
   https://script.google.com/macros/s/AKfycb.../exec
   ```
   คัดลอก URL นี้เก็บไว้ให้ดี (ลงท้ายด้วย `/exec`) — จะใช้ในขั้นตอนที่ 7 และส่งต่อให้ทีมในขั้นตอนที่ 8

> ⚠️ **สำคัญมาก — จำให้ขึ้นใจ:** ทุกครั้งที่แก้โค้ดในไฟล์ `.gs` หลังจากนี้ (ไม่ว่าจะแก้เอง หรือทีมแก้แล้วส่งโค้ดใหม่มาให้พี่เอิร์ธวาง) **URL `/exec` นี้จะไม่อัปเดตพฤติกรรมให้อัตโนมัติ** ต้องทำตามขั้นตอนนี้ทุกครั้ง:
> 1. คลิก **Deploy → Manage deployments**
> 2. คลิกไอคอนรูปดินสอ (**Edit**) ข้างรายการ deployment ที่มีอยู่
> 3. ที่ dropdown **Version** เลือก **New version**
> 4. คลิก **Deploy**
>
> URL จะเหมือนเดิม (ไม่เปลี่ยน) แต่โค้ดที่ทำงานอยู่หลัง URL นั้นจะอัปเดตเป็นเวอร์ชันล่าสุด

---

## 7. Smoke test

1. เปิดแท็บเบราว์เซอร์ใหม่
2. พิมพ์ URL นี้ในแถบที่อยู่ (แทนที่ `{WEB_APP_URL}` และ `{API_TOKEN}` ด้วยค่าจริงของพี่เอิร์ธ):
   ```
   {WEB_APP_URL}?action=getConnectionInfo&token={API_TOKEN}
   ```
   ตัวอย่างจริง:
   ```
   https://script.google.com/macros/s/AKfycb.../exec?action=getConnectionInfo&token=xK9mP2vQzR7wL4nT8jY3hF6cB1dS5gA0
   ```
3. กด Enter

### ผลลัพธ์ที่ถูกต้อง

หน้าจอโชว์ข้อความ JSON แบบนี้ (ไม่มีหน้า error ของ Google):
```json
{"ok":true,"data":{"status":"connected","sheetName":"TungMeow Ledger 2026","sheetUrl":"https://docs.google.com/spreadsheets/d/..."}}
```
ถ้าเห็นแบบนี้ = deploy สำเร็จ พร้อมใช้งานค่ะ

### ผลลัพธ์ที่ผิดพลาด และวิธีแก้

- **`{"ok":false,"error":{"code":"unauthorized","message":"Invalid token"}}`**
  → token ใน URL ไม่ตรงกับค่า `API_TOKEN` ใน Script Properties กลับไปเช็คขั้นตอนที่ 4 ว่าพิมพ์ตรงกันเป๊ะๆ (ไม่มีช่องว่างเกิน)

- **หน้า error ของ Google** (เช่น "Sorry, unable to open the file at this time" หรือหน้าที่ไม่ใช่ JSON เลย)
  → เช็คว่า deploy สำเร็จหรือยัง (ทำขั้นตอนที่ 6 ครบหรือไม่) และเช็คว่าตอน deploy เลือก **Who has access = Anyone** จริงหรือไม่ (ถ้าเลือกผิดเป็นอย่างอื่น คนนอกจะเข้า URL ไม่ได้)

---

## หมายเหตุความเสี่ยงที่ยอมรับ: ไม่มี rate limiting

Backend นี้ deploy แบบ **Anyone** เข้าถึงได้ (access ไม่ได้ถูกจำกัดเฉพาะบัญชี) และ `API_TOKEN` ก็ฝังอยู่ใน client bundle ฝั่ง frontend อยู่แล้ว (ดูหมายเหตุเรื่อง token exposure) — ตัว backend เองไม่มีการจำกัดจำนวนครั้งที่เรียก (rate limiting) เพิ่มเติม ถ้า token หลุดหรือถูกเดาได้ ผู้ไม่หวังดีสามารถยิง `addTransaction` รัวๆ เพื่อ spam แถวเข้าไปใน Sheet หรือยิง request จนใช้โควต้า execution รายวันของ Apps Script project หมด ทำให้แอปหยุดทำงานได้ ยอมรับความเสี่ยงนี้ไว้ตาม scale single-user เหมือนกับ token exposure — ถ้าในอนาคตกลายเป็นเรื่องที่กังวลจริงจัง วิธีแก้แบบง่ายสุดคือทำตัวนับ request ต่อนาทีด้วย `CacheService` โดย key เป็น time bucket หยาบๆ (เช่นปัดเป็นนาที) แล้ว reject ถ้าเกินเพดานที่ตั้งไว้ — เป็น fast-follow ที่ยังไม่จำเป็นตอนนี้

---

## 8. ขั้นตอนต่อไป (ส่งต่อให้ทีม)

พอ smoke test ผ่านแล้ว พี่เอิร์ธจะมีค่า 2 ตัวพร้อมใช้: **Web App URL** (ลงท้าย `/exec`) และ **API_TOKEN** ค่าทั้งสองนี้ต้องถูกนำไปใส่ในไฟล์ `app/.env.local` เป็น `VITE_APPS_SCRIPT_URL` และ `VITE_APPS_SCRIPT_TOKEN` — ขั้นตอนการสร้างไฟล์นี้และเชื่อมต่อฝั่ง frontend จะเป็นงานของเบล (ทีม frontend adapter) แยกต่างหาก พี่เอิร์ธแค่เตรียมค่าทั้งสองนี้ไว้ให้พร้อมส่งต่อ หรือถ้าอยากวางในไฟล์เองเลยก็ทำได้เช่นกันค่ะ

---

_เอกสารนี้เขียนโดยพลอย (Lead Planner) อ้างอิงจากไฟล์ `.gs` จริงใน `gas/` และแผนใน `create-a-initial-project-cuddly-snowglobe.md` ส่วน "6. Deployment"_
