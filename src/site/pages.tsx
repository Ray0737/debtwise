import { useEffect, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Card, Icon, Row } from '../ui'
import { PublicPage, useL, type B } from './Site'

type Item = { icon: string; title: B; text: B; to?: string }

function Items({ items }: { items: Item[] }) {
  const L = useL()
  return (
    <div className="card">
      <div className="list">
        {items.map((i) => <Row key={L(i.title)} icon={i.icon} title={L(i.title)} sub={<span className="wrapsub">{L(i.text)}</span>} to={i.to} />)}
      </div>
    </div>
  )
}

const Block = ({ title, text, id, children }: { title: B; text?: B; id?: string; children: ReactNode }) => {
  const L = useL()
  return (
    <div className="stack" id={id}>
      <div className="stack" style={{ gap: 4 }}><h2>{L(title)}</h2>{text && <p className="muted">{L(text)}</p>}</div>
      {children}
    </div>
  )
}

/* ---------- Home ---------- */
export function Landing() {
  const L = useL()
  return (
    <PublicPage
      back={false}
      title={{ th: 'เห็นหนี้ทุกก้อน รู้ว่าจ่ายไหวเท่าไร', en: 'See every debt. Know what you can pay.' }}
      sub={{ th: 'จัดการหนี้ทุกประเภทในที่เดียว เข้าใจเงินที่เหลือของแต่ละเดือน และคุยกับที่ปรึกษาเรื่องเดือนที่ยาก', en: 'Every kind of debt in one place, what is left each month, and a consultant for the hard months.' }}
      hero={<Link className="btn light" style={{ marginTop: 12, alignSelf: 'flex-start' }} to="/signin"><Icon n="box-arrow-in-right" />{L({ th: 'เริ่มต้นใช้งาน', en: 'Get started' })}</Link>}
    >
      <div className="card shots">
        <img src="/site/shot-home.png" width="390" height="844" alt={L({ th: 'หน้าหลักของ Debtwise แสดงเงินที่เหลือเดือนนี้และแชทกับที่ปรึกษา ข้อมูลตัวอย่าง', en: 'Debtwise home with what is left this month and the chat. Demo data.' })} />
        <img src="/site/shot-debt.png" width="390" height="844" alt={L({ th: 'หน้าหนี้ แสดงหนี้แยกตามธนาคาร ข้อมูลตัวอย่าง', en: 'Debt screen with debts grouped by bank. Demo data.' })} />
      </div>
      <Block title={{ th: 'สำหรับคนที่มีหนี้หลายก้อน', en: 'Made for people who carry more than one loan' }} text={{ th: 'บัตรเครดิต สินเชื่อ รถ บ้าน กยศ. และหนี้นอกระบบ', en: 'Credit cards, personal loans, car, home, student and informal debt.' }}>
        <Items items={[
          { icon: 'collection', title: { th: 'หนี้ทุกก้อนในที่เดียว', en: 'Every debt in one place' }, text: { th: 'ดูแยกตามธนาคารหรือประเภท พร้อมยอดค้าง ดอกเบี้ย และวันครบกำหนด', en: 'Group by bank or by type, with balance, rate and due date.' } },
          { icon: 'file-earmark-arrow-up', title: { th: 'อัปโหลดใบแจ้งหนี้', en: 'Upload a statement' }, text: { th: 'ถ่ายรูปหรือแนบ PDF แล้วตรวจทุกตัวเลขกับบรรทัดต้นฉบับก่อนบันทึก', en: 'Photo or PDF, then check each number against its source line.' } },
          { icon: 'calculator', title: { th: 'ตัวเลขคิดด้วยโค้ด ไม่ใช่ AI', en: 'Numbers come from code, not AI' }, text: { th: 'AI อธิบายและอ่านเอกสารเท่านั้น การคำนวณทำในโปรแกรม', en: 'The AI explains and reads documents. The math runs in the app.' } },
          { icon: 'list-check', title: { th: 'แผนของเดือนนี้', en: 'A plan for this month' }, text: { th: 'กันค่าจำเป็นก่อน จ่ายขั้นต่ำทุกก้อน แล้วเพิ่มให้ก้อนดอกเบี้ยสูงสุด', en: 'Essentials first, every minimum next, then extra to the highest rate.' } },
          { icon: 'arrow-repeat', title: { th: 'เช็กการรีไฟแนนซ์', en: 'Refinance check' }, text: { th: 'เทียบข้อเสนอตัวอย่างหลังหักค่าธรรมเนียม ค่าปรับ และประกัน', en: 'Compare a sample offer after fees, penalty and insurance.' } },
          { icon: 'chat-dots', title: { th: 'คุยกับที่ปรึกษา', en: 'Talk to a consultant' }, text: { th: 'พิมพ์หรือพูด ที่ปรึกษาอ้างอิงตัวเลขของคุณและไม่ย้ายเงินให้', en: 'Type or speak. It uses your own numbers and never moves money.' } },
        ]} />
      </Block>
      <Block title={{ th: 'ทุกอย่างในแอปเดียว', en: 'Everything in one app' }}>
        <Items items={[
          { icon: 'receipt', title: { th: 'ภาษีและลดหย่อน', en: 'Tax and allowances' }, text: { th: 'ประมาณภาษีและรายการลดหย่อน ข้อมูลตัวอย่าง ไม่ใช่คำแนะนำภาษี', en: 'An estimate and allowances. Sample rules, not tax advice.' }, to: '/guide#extras' },
          { icon: 'graph-up-arrow', title: { th: 'เหตุการณ์โทเคน', en: 'Token events' }, text: { th: 'ปลดล็อกและ vesting ที่กำลังมาถึง ข้อมูลตัวอย่าง', en: 'Upcoming unlocks and vesting. Sample data.' }, to: '/guide#extras' },
          { icon: 'shield-lock', title: { th: 'ข้อมูลเป็นของคุณ', en: 'Your data stays yours' }, text: { th: 'ส่งออกหรือลบทั้งหมดได้เอง ข้อความที่ส่งให้ AI ปิดชื่อและเลขบัญชีก่อน', en: 'Export or delete it all. Names and account numbers are removed before text goes to the AI.' }, to: '/guide#data' },
        ]} />
      </Block>
      <div className="card navy cta">
        <h2>{L({ th: 'เริ่มจากการเห็นภาพรวมหนี้ของคุณ', en: 'Start by seeing all of your debt' })}</h2>
        <p className="small">{L({ th: 'ตั้งค่าและเพิ่มหนี้ก้อนแรกใช้เวลาไม่กี่นาที', en: 'Setting up and adding your first debt takes a few minutes.' })}</p>
        <Link className="btn light" style={{ alignSelf: 'flex-start' }} to="/signin"><Icon n="box-arrow-in-right" />{L({ th: 'เริ่มต้นใช้งาน', en: 'Get started' })}</Link>
        <div className="facts">
          <span><Icon n="translate" />{L({ th: 'ไทยและอังกฤษ', en: 'Thai and English' })}</span>
          <span><Icon n="patch-check" />{L({ th: 'คุณยืนยันทุกตัวเลข', en: 'You confirm every number' })}</span>
          <span><Icon n="trash3" />{L({ th: 'ลบข้อมูลได้ทุกเมื่อ', en: 'Delete your data any time' })}</span>
        </div>
      </div>
    </PublicPage>
  )
}

/* ---------- Get the app ---------- */
export function Install() {
  const L = useL()
  const spec: [string, B, B][] = [
    ['layers', { th: 'เวอร์ชัน', en: 'Version' }, { th: '0.1.0 ต้นแบบ', en: '0.1.0 prototype' }],
    ['phone', { th: 'อุปกรณ์', en: 'Devices' }, { th: 'มือถือและคอมพิวเตอร์ ผ่านเบราว์เซอร์', en: 'Phone and computer, in a browser' }],
    ['translate', { th: 'ภาษา', en: 'Languages' }, { th: 'ไทย (ค่าเริ่มต้น) และอังกฤษ', en: 'Thai (default) and English' }],
    ['person-check', { th: 'บัญชี', en: 'Account' }, { th: 'Google หรือลิงก์ทางอีเมล', en: 'Google or an email link' }],
    ['database', { th: 'ข้อมูล', en: 'Data' }, { th: 'เก็บในบัญชี Debtwise ของคุณ (Supabase)', en: 'Stored in your Debtwise account (Supabase)' }],
  ]
  return (
    <PublicPage title={{ th: 'ใช้งานแอป', en: 'Get the app' }} sub={{ th: 'ใช้ได้ในเบราว์เซอร์ และเพิ่มลงหน้าจอหลักได้', en: 'Works in a browser and can be added to your home screen.' }}>
      <div className="card navy">
        <span className="small">{L({ th: 'เวอร์ชันล่าสุด 0.1.0 ต้นแบบ', en: 'Latest version 0.1.0, prototype' })}</span>
        <h2>{L({ th: 'Debtwise บนเว็บ', en: 'Debtwise on the web' })}</h2>
        <p className="small">{L({ th: 'ไม่ต้องติดตั้งอะไร เปิดเบราว์เซอร์แล้วเข้าสู่ระบบ ต้องมีอินเทอร์เน็ต', en: 'Nothing to install. Open a browser and sign in. Needs an internet connection.' })}</p>
        <Link className="btn light" style={{ alignSelf: 'flex-start' }} to="/signin"><Icon n="box-arrow-in-right" />{L({ th: 'เปิด Debtwise', en: 'Open Debtwise' })}</Link>
      </div>
      <Card>
        {spec.map(([i, k, v]) => <div className="kv" key={i}><span className="muted"><Icon n={i} /> {L(k)}</span><span className="strong right">{L(v)}</span></div>)}
      </Card>
      <Block title={{ th: 'เพิ่มลงหน้าจอหลักใน 4 ขั้นตอน', en: 'Add it to your home screen in four steps' }}>
        <Items items={[
          { icon: 'globe2', title: { th: '1. เปิดเว็บ', en: '1. Open the site' }, text: { th: 'เปิด Debtwise ใน Chrome บน Android หรือ Safari บน iPhone', en: 'Open Debtwise in Chrome on Android or Safari on iPhone.' } },
          { icon: 'three-dots', title: { th: '2. เปิดเมนู', en: '2. Open the menu' }, text: { th: 'แตะเมนูของเบราว์เซอร์ หรือปุ่มแชร์บน iPhone', en: 'Tap the browser menu, or the share button on iPhone.' } },
          { icon: 'plus-square', title: { th: '3. เพิ่มลงหน้าจอหลัก', en: '3. Add to home screen' }, text: { th: 'เลือก เพิ่มลงหน้าจอหลัก แล้วยืนยัน', en: 'Choose Add to Home Screen, then confirm.' } },
          { icon: 'play-circle', title: { th: '4. เปิดจากไอคอน', en: '4. Open from the icon' }, text: { th: 'Debtwise เปิดเต็มจอเหมือนแอปทั่วไป', en: 'Debtwise opens full screen like any app.' } },
        ]} />
      </Block>
      <Block title={{ th: 'สิ่งที่ต้องมี', en: 'What you need' }}>
        <Items items={[
          { icon: 'browser-chrome', title: { th: 'เบราว์เซอร์ที่ใหม่พอ', en: 'A current browser' }, text: { th: 'Chrome, Edge, Safari หรือ Firefox เวอร์ชันล่าสุด', en: 'Recent Chrome, Edge, Safari or Firefox.' } },
          { icon: 'person-circle', title: { th: 'บัญชี Google หรืออีเมล', en: 'A Google account or email' }, text: { th: 'ใช้ยืนยันตัวตนเท่านั้น ข้อมูลของคุณเห็นได้เฉพาะคุณ', en: 'Used to sign you in. Your data is visible only to you.' } },
          { icon: 'file-earmark-text', title: { th: 'ใบแจ้งหนี้ (ไม่บังคับ)', en: 'Statements, optional' }, text: { th: 'รูปถ่ายหรือ PDF จะเร็วกว่า แต่กรอกเองได้เสมอ', en: 'A photo or PDF is faster, but you can always type by hand.' } },
        ]} />
      </Block>
    </PublicPage>
  )
}

/* ---------- Get started ---------- */
export function Start() {
  return (
    <PublicPage title={{ th: 'เริ่มต้นใช้งาน', en: 'Get started' }} sub={{ th: 'จากเข้าสู่ระบบถึงแผนแรกของเดือนนี้', en: 'From sign in to your first plan for the month.' }}>
      <Block title={{ th: 'สี่ขั้นตอนถึงแผนแรก', en: 'Four steps to your first plan' }}>
        <Items items={[
          { icon: 'box-arrow-in-right', title: { th: '1. เข้าสู่ระบบ', en: '1. Sign in' }, text: { th: 'ใช้ Google หรือขอลิงก์เข้าสู่ระบบทางอีเมล', en: 'Use Google, or ask for a sign in link by email.' }, to: '/signin' },
          { icon: 'person-lines-fill', title: { th: '2. ตอบห้าขั้นสั้นๆ', en: '2. Answer five short steps' }, text: { th: 'เกี่ยวกับคุณ รายได้ ช่วงเวลาทำงาน ค่าใช้จ่ายจำเป็น และหนี้', en: 'About you, income, work horizon, essentials and debts.' } },
          { icon: 'file-earmark-arrow-up', title: { th: '3. เพิ่มหนี้ก้อนแรก', en: '3. Add your first debt' }, text: { th: 'อัปโหลดใบแจ้งหนี้ พูดคุย หรือกรอกเอง', en: 'Upload a statement, talk it through, or type it in.' }, to: '/guide#add' },
          { icon: 'list-check', title: { th: '4. อ่านแผนเดือนนี้', en: '4. Read this month’s plan' }, text: { th: 'ดูว่าเหลือเท่าไรหรือขาดเท่าไร แล้วถามที่ปรึกษา', en: 'See what is left or short, then ask the consultant.' }, to: '/guide#plan' },
        ]} />
      </Block>
      <Block title={{ th: 'เตรียมสิ่งเหล่านี้ไว้', en: 'Have these ready' }}>
        <Items items={[
          { icon: 'cash-stack', title: { th: 'รายได้ต่อเดือน', en: 'Monthly income' }, text: { th: 'เงินเดือนหรือรายได้เฉลี่ย และวันที่เงินเข้า', en: 'Salary or average income, and the day it arrives.' } },
          { icon: 'house-door', title: { th: 'ค่าใช้จ่ายจำเป็น', en: 'Essentials' }, text: { th: 'ค่าเช่า ค่าอาหาร ค่าเทอม ไม่บังคับ แต่ทำให้แผนแม่นขึ้น', en: 'Rent, food, school fees. Optional, but the plan is more accurate.' } },
          { icon: 'credit-card-2-front', title: { th: 'ข้อมูลหนี้', en: 'Debt details' }, text: { th: 'ยอดค้าง ดอกเบี้ย ยอดชำระขั้นต่ำ และวันครบกำหนด', en: 'Balance, interest rate, minimum payment and due date.' } },
        ]} />
      </Block>
    </PublicPage>
  )
}

/* ---------- Support ---------- */
export function Support() {
  const L = useL()
  const news: [string, B][] = [
    ['collection', { th: 'หนี้ทุกก้อนในที่เดียว แยกตามธนาคารหรือประเภท', en: 'Every debt in one place, by bank or by type.' }],
    ['file-earmark-arrow-up', { th: 'อัปโหลดใบแจ้งหนี้และตรวจกับบรรทัดต้นฉบับ', en: 'Upload a statement and check it against the source line.' }],
    ['list-check', { th: 'แผนรายเดือนแบบ avalanche และส่งออกวันครบกำหนดเป็นปฏิทิน', en: 'A monthly avalanche plan and due dates exported to your calendar.' }],
    ['arrow-repeat', { th: 'เช็กรีไฟแนนซ์หลังหักค่าธรรมเนียมและค่าปรับ', en: 'Refinance check after fees and penalty.' }],
    ['chat-dots', { th: 'ที่ปรึกษาแบบแชต พิมพ์หรือพูดได้', en: 'A chat consultant you can type to or speak with.' }],
    ['receipt', { th: 'หน้าภาษีพร้อมรายการลดหย่อน ข้อมูลตัวอย่าง', en: 'A tax page with allowances. Sample data.' }],
    ['graph-up-arrow', { th: 'หน้าลงทุนแสดงเหตุการณ์โทเคน ข้อมูลตัวอย่าง', en: 'An invest page with token events. Sample data.' }],
    ['translate', { th: 'ภาษาไทยและอังกฤษ สลับได้ทุกหน้า', en: 'Thai and English, switchable on every page.' }],
  ]
  return (
    <PublicPage title={{ th: 'ช่วยเหลือ', en: 'Support' }} sub={{ th: 'คู่มือ บันทึกการเปลี่ยนแปลง และช่องทางร่วมสร้าง', en: 'Help, release notes and ways to get involved.' }}>
      <Items items={[
        { icon: 'book', title: { th: 'อ่านคู่มือ', en: 'Read the guide' }, text: { th: 'ทุกส่วนของแอปทีละขั้น', en: 'Every part of the app, step by step.' }, to: '/guide' },
        { icon: 'rocket-takeoff', title: { th: 'เริ่มต้นใช้งาน', en: 'Get started' }, text: { th: 'สี่ขั้นตอนถึงแผนแรก และสิ่งที่ควรเตรียม', en: 'Four steps to your first plan, and what to prepare.' }, to: '/start' },
        { icon: 'download', title: { th: 'ใช้งานแอป', en: 'Get the app' }, text: { th: 'เปิดในเบราว์เซอร์และเพิ่มลงหน้าจอหลัก', en: 'Open it in a browser and add it to your home screen.' }, to: '/install' },
        { icon: 'people', title: { th: 'เข้าร่วมชุมชน', en: 'Join the community' }, text: { th: 'ส่งความเห็นและช่วยกันทำให้ดีขึ้น', en: 'Share feedback and help make it better.' }, to: '/community' },
      ]} />
      <Block id="prototype" title={{ th: 'Debtwise ยังเป็นต้นแบบ', en: 'Debtwise is a prototype' }} text={{ th: 'ใช้งานได้ แต่ยังอยู่ระหว่างทดสอบ ตัวเลขทุกจุดควรตรวจก่อนตัดสินใจ', en: 'It works, but it is still being tested. Check every number before you decide anything.' }}>
        <Items items={[
          { icon: 'box', title: { th: 'บางหน้าเป็นตัวอย่าง', en: 'Some pages use sample data' }, text: { th: 'ภาษี ลงทุน และข้อเสนอรีไฟแนนซ์ใช้ข้อมูลตัวอย่างและมีป้ายกำกับ', en: 'Tax, invest and refinance offers use sample data and are labelled.' } },
          { icon: 'exclamation-triangle', title: { th: 'ไม่ใช่คำแนะนำ', en: 'Not advice' }, text: { th: 'ให้ข้อมูลและตัวเลขประมาณการ ไม่ใช่คำแนะนำทางการเงิน ภาษี หรือกฎหมาย', en: 'Information and estimates, not financial, tax or legal advice.' } },
          { icon: 'patch-check', title: { th: 'ตรวจตัวเลขเสมอ', en: 'Always check numbers' }, text: { th: 'AI อ่านเอกสารผิดได้ จึงมีหน้าตรวจกับบรรทัดต้นฉบับก่อนบันทึก', en: 'The AI can misread a document, so a review screen shows the source line.' } },
          { icon: 'arrow-repeat', title: { th: 'อาจเปลี่ยนแปลง', en: 'Things can change' }, text: { th: 'หน้าจอและฟีเจอร์อาจเปลี่ยนระหว่างเวอร์ชัน', en: 'Screens and features may change between versions.' } },
        ]} />
      </Block>
      <Block id="release" title={{ th: 'มีอะไรใหม่ใน 0.1.0', en: 'What is new in 0.1.0' }}>
        <div className="card"><div className="list">{news.map(([i, t]) => <Row key={i} icon={i} title={<span className="wrapsub">{L(t)}</span>} />)}</div></div>
      </Block>
    </PublicPage>
  )
}

/* ---------- Community ---------- */
export function Community() {
  const L = useL()
  return (
    <PublicPage title={{ th: 'สร้าง Debtwise ไปด้วยกัน', en: 'Build Debtwise with us' }} sub={{ th: 'ส่งความเห็น ถามคำถาม และช่วยกันทำให้ดีขึ้น', en: 'Share feedback, ask questions and help make it better.' }}>
      <Card title={L({ th: 'เร็วๆ นี้', en: 'Coming soon' })} icon="people">
        <h2>{L({ th: 'ชุมชนผู้ใช้', en: 'User community' })}</h2>
        <p className="muted">{L({ th: 'พื้นที่ส่งความเห็น ถามคำถาม และคุยกับผู้ใช้คนอื่น', en: 'A place for feedback, questions and talking with other users.' })}</p>
      </Card>
      <Card title={L({ th: 'ธีม 1 AI', en: 'Track 1, AI' })} icon="trophy">
        <h2>{L({ th: 'สร้างสำหรับ U-Hackathon', en: 'Built for U-Hackathon' })}</h2>
        <p className="muted">{L({ th: 'Debtwise เป็นต้นแบบที่ทำขึ้นเพื่อช่วยคนทั่วไปเข้าใจหนี้ของตัวเอง', en: 'Debtwise is a prototype made to help ordinary people understand their own debt.' })}</p>
        <Link className="btn" style={{ alignSelf: 'flex-start' }} to="/signin"><Icon n="box-arrow-in-right" />{L({ th: 'ลองใช้งาน', en: 'Try it' })}</Link>
      </Card>
    </PublicPage>
  )
}

/* ---------- Long text pages ---------- */
type Sec = { id: string; title: B; body: ReactNode }

function Doc({ banner, sections }: { banner: { title: B; sub: B; icon?: string; crumb?: B }; sections: Sec[] }) {
  const L = useL()
  useEffect(() => {
    const links = [...document.querySelectorAll<HTMLAnchorElement>('.chips a')]
    if (!links.length || !('IntersectionObserver' in window)) return
    const by = new Map(links.map((a) => [a.getAttribute('href')!.split('#')[1], a]))
    const io = new IntersectionObserver((es) => es.forEach((e) => {
      if (!e.isIntersecting) return
      links.forEach((a) => a.classList.remove('on'))
      by.get(e.target.id)?.classList.add('on')
    }), { rootMargin: '-80px 0px -65% 0px' })
    by.forEach((_, id) => { const el = document.getElementById(id); if (el) io.observe(el) })
    return () => io.disconnect()
  }, [])
  return (
    <PublicPage title={banner.title} sub={banner.sub}>
      <nav className="chips plain" aria-label="Contents">
        {sections.map((s) => <Link key={s.id} to={`#${s.id}`}>{L(s.title)}</Link>)}
      </nav>
      {sections.map((s) => <section key={s.id} id={s.id} className="doc prose"><h2>{L(s.title)}</h2>{s.body}</section>)}
    </PublicPage>
  )
}

const Note = ({ icon = 'info-circle', children }: { icon?: string; children: ReactNode }) => <div className="note"><Icon n={icon} /><p>{children}</p></div>
const P = ({ b }: { b: B }) => { const L = useL(); return <p>{L(b)}</p> }
const Ul = ({ items }: { items: B[] }) => { const L = useL(); return <ul>{items.map((i) => <li key={i.en}>{L(i)}</li>)}</ul> }

export function Guide() {
  const L = useL()
  const sections: Sec[] = [
    { id: 'overview', title: { th: 'ภาพรวม', en: 'Overview' }, body: <>
      <p className="lead">{L({ th: 'Debtwise ช่วยให้คนทั่วไปเห็นหนี้ทั้งหมดในที่เดียว เข้าใจว่าจ่ายไหวเท่าไร เช็กว่ารีไฟแนนซ์คุ้มไหม และคุยเรื่องเดือนที่ยาก', en: 'Debtwise helps a normal person see every debt in one place, understand what they can pay, check whether refinancing is worth it, and talk through a hard month.' })}</p>
      <P b={{ th: 'แอปมีสี่แท็บ คือ หน้าหลัก ลงทุน ภาษี และหนี้ โปรไฟล์เปิดจากแท็บโปรไฟล์', en: 'The app has four tabs: Home, Invest, Tax and Debt. Profile opens from its own tab.' }} />
      <Note icon="calculator">{L({ th: 'ตัวเลขทุกตัวคำนวณในโปรแกรม AI ไม่คิดเลข มันอ่านเอกสารและอธิบายตัวเลขที่โปรแกรมคำนวณแล้ว', en: 'Every number is computed in the app. The AI does not do math. It reads documents and explains numbers the app already computed.' })}</Note>
    </> },
    { id: 'signin', title: { th: 'เข้าสู่ระบบ', en: 'Sign in' }, body: <>
      <P b={{ th: 'เลือกเข้าสู่ระบบด้วย Google หรือกรอกอีเมลเพื่อรับลิงก์เข้าสู่ระบบ ไม่มีรหัสผ่านให้จำ', en: 'Continue with Google, or enter your email to get a sign in link. There is no password to remember.' }} />
      <P b={{ th: 'ข้อมูลของแต่ละบัญชีแยกจากกัน และเห็นได้เฉพาะเจ้าของบัญชี', en: 'Each account’s data is separate and visible only to its owner.' }} />
    </> },
    { id: 'profile', title: { th: 'ตั้งค่าโปรไฟล์', en: 'Set up your profile' }, body: <>
      <P b={{ th: 'ครั้งแรกคุณจะตอบห้าขั้นสั้นๆ ก่อนเข้าแอป', en: 'The first time, you answer five short steps before the app opens.' }} />
      <Ul items={[
        { th: 'เกี่ยวกับคุณ: ชื่อ ปีเกิด และจำนวนคนที่พึ่งรายได้ของคุณ', en: 'About you: name, birth year and how many people depend on your income.' },
        { th: 'รายได้: ประเภทรายได้ รายได้ต่อเดือน รายได้อื่น และวันที่เงินเข้า', en: 'Income: type, monthly income, other income and pay day.' },
        { th: 'ช่วงเวลาทำงาน: อายุที่วางแผนเลิกทำงาน และรายได้หลังจากนั้น (ไม่บังคับ)', en: 'Work horizon: the age you plan to stop working and income after that, optional.' },
        { th: 'ค่าใช้จ่ายจำเป็น: ค่าเช่า อาหาร ค่าเทอม ไม่บังคับ แต่ทำให้แผนแม่นขึ้น', en: 'Essentials: rent, food, school fees. Optional, but it makes the plan more accurate.' },
        { th: 'หนี้: เพิ่มตอนนี้หรือไว้ทีหลังก็ได้', en: 'Debts: add them now or later.' },
      ]} />
      <P b={{ th: 'แก้ไขข้อมูลเหล่านี้ได้ทุกเมื่อในโปรไฟล์', en: 'You can edit all of this later in Profile.' }} />
    </> },
    { id: 'add', title: { th: 'เพิ่มหนี้', en: 'Add debts' }, body: <>
      <P b={{ th: 'ไปที่แท็บหนี้แล้วกดเครื่องหมายบวก มีสามทาง', en: 'Open the Debt tab and press the plus. There are three ways.' }} />
      <Ul items={[
        { th: 'อัปโหลดใบแจ้งหนี้: รูปถ่ายหรือ PDF ส่งให้ AI อ่าน ไม่มีการเก็บไฟล์', en: 'Upload a statement: a photo or PDF is sent to the AI to be read. The file is not stored.' },
        { th: 'พูดคุย: เล่าให้ที่ปรึกษาฟังที่หน้าหลัก', en: 'Talk it through: tell the consultant on the Home tab.' },
        { th: 'กรอกเอง: ฟอร์มสั้นๆ สำหรับผู้ให้กู้ ประเภท ยอดค้าง ดอกเบี้ย ยอดขั้นต่ำ และวันครบกำหนด', en: 'Enter by hand: a short form for lender, type, balance, interest, minimum and due day.' },
      ]} />
      <P b={{ th: 'ประเภทหนี้ที่รองรับ: บัตรเครดิต สินเชื่อส่วนบุคคลและนาโน รถหรือมอเตอร์ไซค์ บ้าน กยศ. และหนี้นอกระบบ', en: 'Supported types: credit card, personal and nano loan, car or motorbike, home, student loan and informal debt.' }} />
    </> },
    { id: 'review', title: { th: 'ตรวจตัวเลขก่อนบันทึก', en: 'Check the numbers' }, body: <>
      <P b={{ th: 'หลังอัปโหลด คุณจะเห็นแต่ละรายการพร้อมบรรทัดต้นฉบับจากเอกสารและระดับความมั่นใจ', en: 'After an upload you see each item with the source line from your document and a confidence level.' }} />
      <P b={{ th: 'แก้ตัวเลขที่ผิด ติ๊กรายการที่ตรงกับเอกสาร แล้วกดบันทึก เฉพาะรายการที่ติ๊กเท่านั้นที่ถูกบันทึก', en: 'Fix any wrong number, tick the ones that match your document, then save. Only ticked items are saved.' }} />
      <Note icon="shield-check">{L({ th: 'เนื้อหาในเอกสารถือเป็นข้อมูล ไม่ใช่คำสั่ง ข้อความในไฟล์ที่พยายามสั่ง AI จะถูกเมิน', en: 'Document content is treated as data, not instructions. Text in a file that tries to command the AI is ignored.' })}</Note>
    </> },
    { id: 'home', title: { th: 'หน้าหลักและที่ปรึกษา', en: 'Home and the consultant' }, body: <>
      <P b={{ th: 'ด้านบนคือสรุปเดือนนี้: เหลือเท่าไรหรือขาดเท่าไร วันครบกำหนดถัดไป รายได้ ค่าจำเป็น ยอดผ่อนหนี้ และภาษีที่กันไว้', en: 'The top is this month at a glance: what is left or short, the next due date, income, essentials, debt payments and tax set aside.' }} />
      <P b={{ th: 'ด้านล่างคือแชตกับที่ปรึกษา พิมพ์หรือกดไมค์เพื่อพูด ที่ปรึกษาอธิบายตัวเลขของคุณและบอกทางเลือก แต่ไม่บอกว่า ควรทำอะไร และไม่ย้ายเงิน', en: 'Below is the chat. Type, or press the mic to speak. The consultant explains your numbers and the options, but it does not tell you what to do and never moves money.' }} />
      <P b={{ th: 'ถ้าข้อความบอกตัวเลขที่ไม่มีในข้อมูลของคุณ แอปจะติดป้ายเตือน และถ้าข้อความเปลี่ยนค่าที่ตั้งไว้ เช่น ค่าใช้จ่ายจำเป็น คุณต้องกดยืนยันก่อนจะบันทึก', en: 'If a reply contains a figure that is not in your data, the app flags it. If a message proposes a change such as your essentials, you confirm it before it is saved.' }} />
      <P b={{ th: 'ส่งออกวันครบกำหนดเป็นไฟล์ปฏิทิน .ics ได้จากการ์ดสรุป', en: 'You can export due dates as an .ics calendar file from the summary card.' }} />
    </> },
    { id: 'debt', title: { th: 'หน้าหนี้', en: 'The Debt tab' }, body: <>
      <P b={{ th: 'สลับดูตามผู้ให้กู้หรือตามประเภท กดกลุ่มเพื่อดูรายการหนี้ และกดรายการเพื่อดูรายละเอียด', en: 'Switch between lender and type. Open a group to see its loans, and open a loan for its details.' }} />
      <P b={{ th: 'หน้ารายละเอียดแสดงแหล่งที่มาของตัวเลขและป้ายสถานะ ยืนยันแล้ว ต้องตรวจ หรือคุณระบุเอง คุณแก้ไขหรือลบรายการได้ที่นี่', en: 'The detail page shows where each number came from and a status badge: verified, needs review or user stated. You can edit or delete a loan here.' }} />
    </> },
    { id: 'plan', title: { th: 'แผนรายเดือนและรีไฟแนนซ์', en: 'Monthly plan and refinance' }, body: <>
      <P b={{ th: 'แผนกันค่าใช้จ่ายจำเป็นก่อน จ่ายขั้นต่ำทุกก้อน แล้วเพิ่มเงินที่เหลือให้ก้อนที่ดอกเบี้ยสูงสุด (วิธี avalanche)', en: 'The plan protects essentials first, pays every minimum, then adds what is left to the highest interest rate (the avalanche method).' }} />
      <P b={{ th: 'ถ้าเงินไม่พอ แผนบอกว่าขาดเท่าไรและก้อนไหนจ่ายไม่ครบ ควรคุยกับผู้ให้กู้ก่อนพลาดการชำระ', en: 'If money is short, the plan shows by how much and which loans go unpaid. Talk to your lender before a payment is missed.' }} />
      <P b={{ th: 'เช็กรีไฟแนนซ์เทียบข้อเสนอตัวอย่างกับหนี้ของคุณ โดยคิดค่าธรรมเนียม ค่าปรับ และประกันทั้งหมด แล้วแสดงส่วนต่างสุทธิ พร้อมเตือนถ้าระยะเวลายาวขึ้น', en: 'The refinance check compares a sample offer with your loan, counting fees, penalty and insurance, and shows the net difference. It warns you if the term gets longer.' }} />
    </> },
    { id: 'extras', title: { th: 'ลงทุนและภาษี', en: 'Invest and Tax' }, body: <>
      <P b={{ th: 'สองแท็บนี้เป็นส่วนเสริม ใช้ข้อมูลตัวอย่างและมีป้ายกำกับ ตัวอย่าง ทุกส่วน', en: 'These two tabs are add-ons. They use sample data and every block is labelled sample.' }} />
      <Ul items={[
        { th: 'ลงทุน: เหตุการณ์ปลดล็อกและ vesting ของโทเคนที่กำลังจะมาถึง พร้อมเงินที่เหลือหลังหนี้ ให้ข้อมูลเท่านั้น', en: 'Invest: upcoming token unlock and vesting events next to what is left after debt. Information only.' },
        { th: 'ภาษี: ประมาณภาษีจากรายได้ต่อปี พร้อมสมมติฐานและรายการลดหย่อนที่อาจใช้ได้ ไม่ใช่คำแนะนำภาษี', en: 'Tax: an estimate from your yearly income with assumptions and allowances you may claim. Not tax advice.' },
      ]} />
      <Note icon="exclamation-triangle">{L({ th: 'กฎภาษีในแอปเป็นข้อมูลตัวอย่างและยังไม่ได้ตรวจกับกรมสรรพากร อย่าใช้ยื่นภาษี', en: 'The tax rules in the app are sample data and have not been checked against the Revenue Department. Do not use them to file taxes.' })}</Note>
    </> },
    { id: 'data', title: { th: 'ข้อมูลของคุณ', en: 'Your data' }, body: <>
      <P b={{ th: 'ที่โปรไฟล์ คุณส่งออกสำเนาข้อมูลเป็นไฟล์ JSON โหลดหรือลบข้อมูลสาธิต และลบข้อมูลทั้งหมดของคุณได้ การลบทั้งหมดต้องพิมพ์ delete เพื่อยืนยัน', en: 'In Profile you can export a copy as a JSON file, load or remove demo data, and delete all of your data. Deleting everything needs you to type delete to confirm.' }} />
      <P b={{ th: 'รายละเอียดอยู่ใน', en: 'The details are in the' }} />
      <p><Link className="link" to="/privacy">{L({ th: 'นโยบายความเป็นส่วนตัว', en: 'privacy policy' })}</Link></p>
    </> },
    { id: 'limits', title: { th: 'สิ่งที่ Debtwise ไม่ทำ', en: 'What Debtwise does not do' }, body: <Ul items={[
      { th: 'ไม่มีบัญชีเงินหรือการโอนเงิน', en: 'No money account and no payments.' },
      { th: 'ไม่เชื่อมบัญชีธนาคารหรือเครดิตบูโรโดยตรง', en: 'No live bank or credit bureau connection.' },
      { th: 'ไม่ยื่นภาษีและไม่ซื้อขายสินทรัพย์ให้', en: 'No tax filing and no trading.' },
      { th: 'ไม่ให้คำแนะนำทางการเงิน ภาษี หรือกฎหมาย', en: 'No financial, tax or legal advice.' },
    ]} /> },
  ]
  return <Doc banner={{ title: { th: 'คู่มือ', en: 'Guide' }, sub: { th: 'ทุกส่วนของ Debtwise ทีละขั้น', en: 'Every part of Debtwise, step by step.' }, icon: 'book', crumb: { th: 'คู่มือ', en: 'Guide' } }} sections={sections} />
}

export function Terms() {
  const sections: Sec[] = [
    { id: 'draft', title: { th: 'ร่างฉบับนี้', en: 'About this draft' }, body: <>
      <P b={{ th: 'ข้อกำหนดนี้เป็นร่างสำหรับต้นแบบ Debtwise 0.1.0 อัปเดตล่าสุด 15 ตุลาคม 2026 และอาจเปลี่ยนก่อนการเผยแพร่จริง', en: 'These terms are a draft for the Debtwise 0.1.0 prototype. Last updated 15 October 2026. They may change before any public release.' }} />
    </> },
    { id: 'service', title: { th: 'บริการนี้คืออะไร', en: 'What the service is' }, body: <>
      <P b={{ th: 'Debtwise เป็นเครื่องมือให้ข้อมูลที่ช่วยให้คุณเห็นหนี้ ประมาณเงินที่เหลือในแต่ละเดือน และเทียบตัวเลขรีไฟแนนซ์ ไม่ได้เป็นธนาคาร ผู้ให้กู้ นายหน้า หรือที่ปรึกษาที่ได้รับใบอนุญาต', en: 'Debtwise is an information tool that helps you see your debt, estimate what is left each month and compare refinance numbers. It is not a bank, a lender, a broker or a licensed adviser.' }} />
      <P b={{ th: 'ไม่มีการเก็บเงิน โอนเงิน หรือชำระหนี้แทนคุณ', en: 'It does not hold, move or pay money for you.' }} />
    </> },
    { id: 'advice', title: { th: 'ไม่ใช่คำแนะนำ', en: 'Not advice' }, body: <>
      <P b={{ th: 'ตัวเลข แผน และข้อความของที่ปรึกษาเป็นการประมาณและให้ข้อมูล ไม่ใช่คำแนะนำทางการเงิน ภาษี กฎหมาย หรือการลงทุน ตรวจสอบกับผู้ให้กู้หรือผู้เชี่ยวชาญก่อนตัดสินใจ', en: 'Numbers, plans and consultant replies are estimates and information, not financial, tax, legal or investment advice. Check with your lender or a professional before you decide.' }} />
      <P b={{ th: 'หน้าลงทุน ภาษี และข้อเสนอรีไฟแนนซ์ใช้ข้อมูลตัวอย่างที่ยังไม่ได้ตรวจสอบ', en: 'The Invest and Tax pages and the refinance offers use sample data that has not been verified.' }} />
    </> },
    { id: 'ai', title: { th: 'การใช้ AI', en: 'Use of AI' }, body: <>
      <P b={{ th: 'AI อาจอ่านเอกสารผิดหรืออธิบายไม่ครบ คุณต้องตรวจตัวเลขในหน้าตรวจก่อนบันทึก และเป็นผู้รับผิดชอบการตัดสินใจของคุณเอง', en: 'The AI can misread a document or explain something incompletely. You must check the numbers on the review screen before saving, and you are responsible for your own decisions.' }} />
    </> },
    { id: 'account', title: { th: 'บัญชีและความรับผิดชอบของคุณ', en: 'Your account and duties' }, body: <Ul items={[
      { th: 'ใช้ข้อมูลของคุณเองหรือข้อมูลที่คุณมีสิทธิ์ใช้', en: 'Use your own data, or data you have the right to use.' },
      { th: 'ดูแลบัญชี Google หรืออีเมลที่ใช้เข้าสู่ระบบให้ปลอดภัย', en: 'Keep the Google or email account you sign in with secure.' },
      { th: 'ไม่พยายามเจาะระบบ รบกวนบริการ หรืออัปโหลดไฟล์ที่เป็นอันตราย', en: 'Do not try to break in, disrupt the service or upload harmful files.' },
    ]} /> },
    { id: 'asis', title: { th: 'ให้บริการตามสภาพ', en: 'Provided as is' }, body: <>
      <P b={{ th: 'ต้นแบบนี้ให้บริการตามสภาพ ไม่มีการรับประกันความถูกต้อง ความต่อเนื่อง หรือความเหมาะสมกับวัตถุประสงค์ใดๆ ในขอบเขตที่กฎหมายอนุญาต ผู้พัฒนาไม่รับผิดชอบความเสียหายจากการใช้ตัวเลขในแอป', en: 'This prototype is provided as is, with no promise of accuracy, availability or fitness for any purpose. To the extent the law allows, the developer is not liable for loss from using numbers in the app.' }} />
    </> },
    { id: 'end', title: { th: 'การยุติและการเปลี่ยนแปลง', en: 'Ending and changes' }, body: <>
      <P b={{ th: 'คุณหยุดใช้และลบข้อมูลได้ทุกเมื่อจากหน้าโปรไฟล์ เราอาจเปลี่ยนหรือหยุดต้นแบบนี้ และอาจแก้ข้อกำหนดเมื่อมีการเผยแพร่จริง', en: 'You can stop and delete your data any time from Profile. We may change or stop this prototype and may revise these terms for a real release.' }} />
    </> },
  ]
  return <Doc banner={{ title: { th: 'ข้อกำหนด', en: 'Terms' }, sub: { th: 'ร่างข้อกำหนดการใช้งานสำหรับต้นแบบ', en: 'Draft terms of use for the prototype.' }, icon: 'file-earmark-text', crumb: { th: 'ข้อกำหนด', en: 'Terms' } }} sections={sections} />
}

export function Privacy() {
  const rows: [B, B][] = [
    [{ th: 'โปรไฟล์', en: 'Profile' }, { th: 'ชื่อ ปีเกิด จำนวนผู้พึ่งพา รายได้ วันที่เงินเข้า อายุเลิกทำงาน ค่าใช้จ่ายจำเป็น ภาษา', en: 'Name, birth year, dependants, income, pay day, retirement age, essentials, language.' }],
    [{ th: 'หนี้', en: 'Debts' }, { th: 'ผู้ให้กู้ ประเภท ยอดค้าง ดอกเบี้ย ยอดขั้นต่ำ วันครบกำหนด เดือนที่เหลือ สถานะ', en: 'Lender, type, balance, interest, minimum, due day, months left, status.' }],
    [{ th: 'แหล่งที่มา', en: 'Sources' }, { th: 'ชื่อไฟล์ หน้า และบรรทัดข้อความที่ใช้ยืนยันตัวเลข ไม่เก็บไฟล์', en: 'File name, page and the source line used to confirm a number. The file itself is not stored.' }],
    [{ th: 'ข้อความ', en: 'Messages' }, { th: 'บทสนทนากับที่ปรึกษา', en: 'Your conversation with the consultant.' }],
    [{ th: 'แผน', en: 'Plans' }, { th: 'สรุปแผนรายเดือนที่บันทึก', en: 'Saved monthly plan snapshots.' }],
  ]
  const L = useL()
  const sections: Sec[] = [
    { id: 'draft', title: { th: 'ร่างฉบับนี้', en: 'About this draft' }, body: <>
      <P b={{ th: 'นี่เป็นร่างนโยบายความเป็นส่วนตัวสำหรับต้นแบบ Debtwise 0.1.0 อัปเดตล่าสุด 15 ตุลาคม 2026', en: 'This is a draft privacy policy for the Debtwise 0.1.0 prototype. Last updated 15 October 2026.' }} />
    </> },
    { id: 'collect', title: { th: 'ข้อมูลที่เก็บ', en: 'What we keep' }, body: <>
      <P b={{ th: 'เราเก็บเฉพาะข้อมูลที่คุณป้อนหรือยืนยัน และอีเมลที่ใช้เข้าสู่ระบบ', en: 'We keep only what you enter or confirm, plus the email you sign in with.' }} />
      <div className="tablewrap"><table><thead><tr><th>{L({ th: 'ข้อมูล', en: 'Data' })}</th><th>{L({ th: 'รายละเอียด', en: 'What it holds' })}</th></tr></thead>
        <tbody>{rows.map(([a, b]) => <tr key={a.en}><td>{L(a)}</td><td>{L(b)}</td></tr>)}</tbody></table></div>
    </> },
    { id: 'where', title: { th: 'เก็บที่ไหน', en: 'Where it is stored' }, body: <>
      <P b={{ th: 'ข้อมูลเก็บในฐานข้อมูล Supabase ของบัญชี Debtwise ทุกตารางเปิด Row Level Security ผู้ใช้อ่านและเขียนได้เฉพาะแถวของตัวเอง ยังไม่มีโหมดเก็บในเครื่องเท่านั้น', en: 'Data is stored in the Debtwise Supabase database. Every table uses Row Level Security, so a user can read and write only their own rows. There is no local-only mode yet.' }} />
    </> },
    { id: 'ai', title: { th: 'AI และเสียง', en: 'AI and voice' }, body: <>
      <Ul items={[
        { th: 'ข้อความที่ส่งให้ AI ถูกลบชื่อ เลขบัญชี เบอร์โทร และเลขบัตรประชาชนก่อนส่ง', en: 'Text sent to the AI has names, account numbers, phone numbers and national ID numbers removed first.' },
        { th: 'ไฟล์ที่อัปโหลดถูกส่งให้ AI เพื่ออ่านค่าเท่านั้น ไม่ถูกเก็บ', en: 'An uploaded file is sent to the AI only to read its values. It is not stored.' },
        { th: 'ถ้าใช้ไมค์หรือฟังเสียงตอบ เสียงหรือข้อความจะถูกส่งไปยังบริการเสียง (ElevenLabs) และฟังก์ชันของเราไม่เก็บหรือบันทึกเนื้อหา', en: 'If you use the mic or hear replies, audio or text goes to the voice service (ElevenLabs). Our functions do not store or log the content.' },
        { th: 'คีย์ของบริการ AI อยู่ฝั่งเซิร์ฟเวอร์เท่านั้น ไม่อยู่ในเบราว์เซอร์', en: 'The AI service keys live on the server only, never in your browser.' },
      ]} />
      <Note icon="info-circle">{L({ th: 'ข้อความที่ถูกปิดข้อมูลแล้วที่ส่งให้ AI ดูย้อนหลังได้ในประวัติบทสนทนา', en: 'The masked text that was sent to the AI is kept with the conversation so it can be reviewed.' })}</Note>
    </> },
    { id: 'share', title: { th: 'การแบ่งปัน', en: 'Sharing' }, body: <>
      <P b={{ th: 'เราไม่ขายข้อมูลของคุณและไม่แสดงโฆษณา ข้อมูลถูกประมวลผลโดยผู้ให้บริการที่จำเป็นต่อการทำงาน คือ Supabase สำหรับบัญชีและฐานข้อมูล ผู้ให้บริการ AI และบริการเสียง', en: 'We do not sell your data and show no ads. It is processed by the providers the app needs to work: Supabase for accounts and the database, the AI provider and the voice service.' }} />
    </> },
    { id: 'control', title: { th: 'การควบคุมของคุณ', en: 'Your controls' }, body: <Ul items={[
      { th: 'ส่งออกสำเนาข้อมูลทั้งหมดจากหน้าโปรไฟล์', en: 'Export a copy of everything from Profile.' },
      { th: 'แก้ไขโปรไฟล์และหนี้ได้ทุกเมื่อ', en: 'Edit your profile and debts any time.' },
      { th: 'ลบข้อมูลทั้งหมดของคุณจากหน้าโปรไฟล์ ซึ่งลบหนี้ แผน และข้อความ', en: 'Delete all of your data from Profile, which removes debts, plans and messages.' },
    ]} /> },
    { id: 'storage', title: { th: 'ในเบราว์เซอร์ของคุณ', en: 'In your browser' }, body: <>
      <P b={{ th: 'เราใช้ที่เก็บในเบราว์เซอร์เพื่อเก็บเซสชันการเข้าสู่ระบบและภาษาที่คุณเลือก ไม่ใช้คุกกี้โฆษณาหรือการติดตาม', en: 'We use browser storage to keep your sign in session and your chosen language. We use no advertising or tracking cookies.' }} />
    </> },
  ]
  return <Doc banner={{ title: { th: 'ความเป็นส่วนตัว', en: 'Privacy' }, sub: { th: 'ร่างนโยบายความเป็นส่วนตัวสำหรับต้นแบบ', en: 'Draft privacy policy for the prototype.' }, icon: 'shield-check', crumb: { th: 'ความเป็นส่วนตัว', en: 'Privacy' } }} sections={sections} />
}
