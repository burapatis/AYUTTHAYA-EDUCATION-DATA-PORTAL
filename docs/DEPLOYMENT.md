# คู่มือเผยแพร่เว็บไซต์ด้วย GitHub Pages

คู่มือนี้อธิบายการนำศูนย์ข้อมูลการศึกษาจังหวัดพระนครศรีอยุธยาขึ้นเผยแพร่ด้วย GitHub Pages ตั้งแต่การเตรียม repository จนถึงการตรวจสอบ แก้ปัญหา และย้อนกลับเวอร์ชัน

## รูปแบบการเผยแพร่

เว็บไซต์เป็น Astro แบบ static output โดย GitHub Actions จะดำเนินการดังนี้ทุกครั้งที่มีการ push ไปยังสาขา `main`

1. ติดตั้ง Node.js และ dependencies ตาม lockfile
2. ตรวจสอบความสอดคล้องของข้อมูล JSON
3. ตรวจ type และสร้างเว็บไซต์ลงใน `dist/`
4. บรรจุ `dist/` เป็น GitHub Pages artifact
5. เผยแพร่ artifact ไปยัง environment ชื่อ `github-pages`

Workflow อยู่ที่ `.github/workflows/deploy-pages.yml` และไม่จำเป็นต้อง commit โฟลเดอร์ `dist/` หรือสร้างสาขา `gh-pages`

## สิ่งที่ต้องมีก่อนเริ่ม

- บัญชี GitHub และ repository ปลายทาง
- สิทธิ์ Admin หรือ Maintainer สำหรับตั้งค่า GitHub Pages
- สาขาสำหรับเผยแพร่ชื่อ `main` หากใช้ชื่ออื่นให้แก้ `on.push.branches` ใน workflow
- หากต้องการทดสอบในเครื่อง ให้ใช้ Node.js 24 และ pnpm เวอร์ชันที่ระบุใน `package.json`

> **ตรวจข้อมูลก่อนใช้ public repository:** ไฟล์ทั้งหมดที่ commit ไปยัง public repository จะเปิดให้บุคคลทั่วไปอ่านได้ แม้ไฟล์นั้นจะไม่ได้ถูกนำไปไว้ใน `dist/` ก็ตาม ตรวจสอบไฟล์ต้นฉบับ เอกสารภายใน และไฟล์ prompt ว่าไม่มีข้อมูลส่วนบุคคล ข้อมูลติดต่อ หรือข้อมูลที่ไม่ต้องการเผยแพร่ก่อน push

## 1. ตรวจสอบในเครื่อง

รันจากโฟลเดอร์รากของโครงการ:

```bash
corepack enable
pnpm install --frozen-lockfile
pnpm run validate:data
pnpm run build
```

ผลที่คาดหวัง:

- การตรวจข้อมูลรายงานว่า schema, ยอดรวม และยอดย่อยสอดคล้องกัน
- Astro type check ไม่มี error
- สร้างหน้าเว็บไซต์และ JSON endpoints ใน `dist/` สำเร็จ

ใช้ `pnpm run dev` สำหรับตรวจหน้าจอระหว่างพัฒนา โดยไม่ต้อง commit `node_modules/`, `.astro/` หรือ `dist/`

## 2. เตรียม GitHub repository

หากโฟลเดอร์นี้ยังไม่เป็น Git repository ให้สร้าง repository เปล่าบน GitHub แล้วเชื่อมต่อจากเครื่อง:

```bash
git init
git branch -M main
git remote add origin https://github.com/OWNER/REPOSITORY.git
git status --short
```

ตรวจรายการจาก `git status` ทีละไฟล์ก่อนเลือก commit อย่าเพิ่มไฟล์ทั้งหมดโดยไม่ตรวจความเป็นส่วนตัว จากนั้น commit source code, lockfile, JSON data ที่อนุมัติแล้ว และ workflow ก่อน push ไปยัง `main`

หาก repository ใช้ default branch ชื่ออื่น ให้เปลี่ยนชื่อ branch ใน `.github/workflows/deploy-pages.yml` ให้ตรงกันก่อน push

## 3. เปิดใช้งาน GitHub Pages

1. เปิด repository บน GitHub
2. ไปที่ **Settings → Pages**
3. ในส่วน **Build and deployment** เลือก **Source: GitHub Actions**
4. ไปที่แท็บ **Actions** และเปิด workflow **Deploy GitHub Pages**
5. รอ job `Validate and build` และ `Deploy` สำเร็จ
6. เปิด URL ที่แสดงใน deployment summary หรือใน **Settings → Pages**

Workflow จะอ่านโดเมนและ repository subpath จาก GitHub Pages โดยอัตโนมัติ:

- User/organization site: `https://OWNER.github.io/`
- Project site: `https://OWNER.github.io/REPOSITORY/`

จึงไม่ต้องกำหนด `PUBLIC_SITE_URL` หรือ `PUBLIC_BASE_PATH` เป็น GitHub secret

## 4. การเผยแพร่ครั้งถัดไป

การ push commit ไปยัง `main` จะเริ่ม deployment ใหม่อัตโนมัติ ก่อนเผยแพร่ข้อมูลรอบใหม่ควร:

1. แก้ไฟล์ใน `src/data/v1/`
2. ปรับ `manifest.json` เมื่อขอบเขต รอบข้อมูล หรือสถานะเปลี่ยน
3. เปลี่ยน `schemaVersion` เมื่อมี breaking change ต่อชื่อ field หรือโครงสร้างข้อมูล
4. รัน `pnpm run validate:data` และ `pnpm run build`
5. ตรวจหน้าเว็บบน desktop และ mobile
6. commit และ push เมื่อผ่านการตรวจแล้ว

สามารถสั่งเผยแพร่ด้วยตนเองได้จาก **Actions → Deploy GitHub Pages → Run workflow** โดยไม่ต้องสร้าง commit ใหม่

## 5. ตั้งค่า custom domain

ควรยืนยันความเป็นเจ้าของโดเมนกับ GitHub ก่อนใช้งาน เพื่อลดความเสี่ยงการยึดโดเมน

1. ไปที่ **Settings → Pages → Custom domain**
2. ใส่โดเมนและกด **Save** ก่อนแก้ DNS
3. ตั้ง DNS กับผู้ให้บริการโดเมน:
   - สำหรับ `data.example.go.th` ให้สร้าง `CNAME` ชี้ไปที่ `OWNER.github.io` โดยไม่ใส่ชื่อ repository ต่อท้าย
   - สำหรับ apex domain เช่น `example.go.th` ให้ใช้ `A`, `AAAA`, `ALIAS` หรือ `ANAME` ตามค่าปัจจุบันในเอกสาร GitHub Pages
4. รอ DNS propagation ซึ่งอาจใช้เวลาถึง 24 ชั่วโมง
5. เมื่อ certificate พร้อม ให้เปิด **Enforce HTTPS**

เมื่อใช้ custom GitHub Actions workflow การตั้งค่า custom domain ใน GitHub เป็นแหล่งข้อมูลหลัก ไม่จำเป็นต้องสร้างไฟล์ `CNAME` ในโครงการ

เอกสารอ้างอิง:

- [Managing a custom domain for GitHub Pages](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site/managing-a-custom-domain-for-your-github-pages-site)
- [Securing a GitHub Pages site with HTTPS](https://docs.github.com/en/pages/getting-started-with-github-pages/securing-your-github-pages-site-with-https)

## 6. การย้อนกลับเมื่อ deployment มีปัญหา

วิธีที่ตรวจสอบย้อนหลังได้ดีที่สุดคือ revert commit ที่มีปัญหาแล้ว push กลับไปยัง `main`:

```bash
git log --oneline
git revert COMMIT_SHA
git push origin main
```

GitHub Actions จะสร้างและเผยแพร่เวอร์ชันที่ย้อนกลับแล้วโดยอัตโนมัติ หลีกเลี่ยง `git reset --hard` หรือการ force-push บนสาขาที่ใช้งานร่วมกัน

หากเป็นความล้มเหลวชั่วคราวของ GitHub ให้เปิด workflow run เดิมและเลือก **Re-run failed jobs** ก่อนแก้ source code

## 7. การแก้ปัญหาที่พบบ่อย

### Workflow ไม่เริ่มทำงาน

- ตรวจว่า push ไปยังสาขา `main`
- ตรวจว่า GitHub Actions เปิดใช้งานใน repository
- หาก default branch ใช้ชื่ออื่น ให้แก้ trigger ใน workflow
- ตรวจนโยบายของ organization ว่าอนุญาต official actions ที่ workflow pin ไว้

### Build ล้มเหลวที่ `pnpm install`

- commit `pnpm-lock.yaml` พร้อม `package.json` ทุกครั้ง
- รัน `pnpm install` ในเครื่องและตรวจความเปลี่ยนแปลงของ lockfile
- อย่าแก้ lockfile ด้วยมือ

### Data validation ล้มเหลว

- อ่านชื่อ assertion ใน log เพื่อดูชุดข้อมูลที่ยอดไม่ตรง
- ตรวจยอดรวมระดับจังหวัดกับผลรวมรายอำเภอ ระดับชั้น เพศ หรือหมวดสาเหตุ
- แก้ข้อมูลหรือ metadata ต้นทาง ห้ามปิด validation เพื่อให้ deployment ผ่าน

### หน้าเว็บเปิดได้แต่ CSS, JavaScript หรือลิงก์เป็น 404

- ตรวจว่า Pages Source เป็น **GitHub Actions**
- ตรวจ output ของขั้น **Configure GitHub Pages**
- อย่า hard-code `/REPOSITORY/` ใน component; ใช้ helper `withBase()`
- รัน build จำลอง subpath ก่อนแก้ไขโครงสร้าง routing:

```bash
PUBLIC_SITE_URL=https://OWNER.github.io \
PUBLIC_BASE_PATH=/REPOSITORY \
pnpm run build
```

### Deployment ถูกปฏิเสธสิทธิ์

- ตรวจว่า job `deploy` มี `pages: write` และ `id-token: write`
- ตรวจ protection rules ของ environment `github-pages`
- ตรวจว่าสาขา `main` ได้รับอนุญาตให้ deploy ไปยัง environment นี้

### Custom domain หรือ HTTPS ยังไม่พร้อม

- ตรวจ DNS record ว่าชี้ตรงไปยัง `OWNER.github.io`
- ลบ record ที่ขัดแย้งหรือ wildcard DNS ที่ไม่จำเป็น
- หากมี CAA record ต้องอนุญาต `letsencrypt.org`
- รอ DNS propagation แล้วลองลบและเพิ่ม custom domain ใหม่ใน Settings หาก certificate ไม่เริ่มสร้าง

## 8. ข้อจำกัดของ GitHub Pages

- รองรับเฉพาะไฟล์ static ไม่มี server runtime, database, session หรือ API ที่เก็บ secret ฝั่ง server
- ทุกข้อมูลที่ส่งไปกับ HTML, JavaScript หรือ JSON endpoint เป็นข้อมูลสาธารณะ
- GitHub Pages อาจเผยแพร่เว็บไซต์ต่อสาธารณะ แม้ source repository จะเป็น private ทั้งนี้ขึ้นอยู่กับแผนและนโยบายองค์กร
- ขนาดเว็บไซต์ที่เผยแพร่มีขีดจำกัด 1 GB
- deployment timeout ที่ 10 นาที
- มี soft bandwidth limit 100 GB ต่อเดือน และอาจมี rate limiting
- การเปลี่ยนข้อมูลต้อง build และ deploy ใหม่
- ไม่เหมาะกับการรับรหัสผ่าน ข้อมูลบัตร หรือธุรกรรมที่มีความอ่อนไหว

ดูข้อจำกัดปัจจุบันได้ที่ [GitHub Pages limits](https://docs.github.com/en/pages/getting-started-with-github-pages/github-pages-limits)

## 9. แนวทางดูแลระบบ

- เปิด branch protection สำหรับ `main` และบังคับ review ก่อน merge
- เพิ่ม protection rule ให้ environment `github-pages` อนุญาตเฉพาะ default branch
- เก็บ action references แบบ full commit SHA และทบทวนเวอร์ชันเป็นระยะ
- ตรวจสอบข้อมูลส่วนบุคคลและสิทธิ์การเผยแพร่ของเอกสารต้นทางก่อน commit
- เก็บไฟล์ข้อมูลต้นฉบับที่ยังไม่อนุมัติไว้นอก public repository
- ตรวจหน้าเว็บและ JSON downloads หลัง deployment ทุกครั้ง
- ติดตาม workflow failures และ dependency security advisories

## Checklist ก่อนเปิดใช้งานจริง

- [ ] ตรวจว่า repository ไม่มี secret หรือข้อมูลส่วนบุคคลที่ไม่ควรเผยแพร่
- [ ] `pnpm run validate:data` ผ่าน
- [ ] `pnpm run build` ผ่าน
- [ ] GitHub Pages Source ตั้งเป็น GitHub Actions
- [ ] Workflow ทั้ง build และ deploy สำเร็จ
- [ ] ทุกหน้าหลักและ JSON downloads เปิดได้จาก URL จริง
- [ ] ทดสอบ desktop, mobile, keyboard navigation และ custom 404
- [ ] แสดงรอบข้อมูล แหล่งที่มา และข้อจำกัดครบถ้วน
- [ ] หากใช้ custom domain ให้ตรวจ DNS และเปิด Enforce HTTPS
- [ ] มีผู้รับผิดชอบอนุมัติข้อมูลและ deployment อย่างชัดเจน
