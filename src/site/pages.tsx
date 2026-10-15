import type { ReactNode } from 'react'
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
          { icon: 'receipt', title: { th: 'ภาษีและลดหย่อน', en: 'Tax and allowances' }, text: { th: 'ประมาณภาษีและรายการลดหย่อนตามกฎของกรมสรรพากรปี 2568 ไม่ใช่คำแนะนำภาษี', en: 'An estimate and allowances from the Revenue Department rules for 2568. Not tax advice.' }, to: '/guide#extras' },
          { icon: 'graph-up-arrow', title: { th: 'เหตุการณ์โทเคน', en: 'Token events' }, text: { th: 'ราคาและปริมาณเหรียญจริงของโทเคนที่มีตารางปลดล็อก ส่วนวันปลดล็อกเป็นข้อมูลตัวอย่าง', en: 'Real prices and supply for tokens with unlock schedules. Unlock dates are sample data.' }, to: '/guide#extras' },
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
      <Block title={{ th: 'ควรรู้', en: 'Good to know' }}>
        <Items items={[
          { icon: 'wifi', title: { th: 'ต้องมีอินเทอร์เน็ต', en: 'You need to be online' }, text: { th: 'ข้อมูลอยู่ในบัญชีออนไลน์ของคุณ จึงเปิดดูตอนออฟไลน์ไม่ได้', en: 'Your data lives in your online account, so it cannot be opened offline.' } },
          { icon: 'arrow-repeat', title: { th: 'อัปเดตอัตโนมัติ', en: 'Updates come by themselves' }, text: { th: 'เปิดแอปใหม่เพื่อรับเวอร์ชันล่าสุด ไม่ต้องติดตั้งซ้ำ', en: 'Open the app again to get the latest version. There is nothing to reinstall.' } },
          { icon: 'translate', title: { th: 'ภาษาของคุณ', en: 'Your language' }, text: { th: 'ไทยเป็นค่าเริ่มต้น เปลี่ยนเป็นอังกฤษได้ในหน้าโปรไฟล์', en: 'Thai is the default. Switch to English in Profile.' } },
          { icon: 'trash3', title: { th: 'ลบได้เสมอ', en: 'Delete any time' }, text: { th: 'ส่งออกหรือลบข้อมูลของคุณได้จากหน้าโปรไฟล์', en: 'Export or delete your data from the Profile page.' } },
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
      <Block title={{ th: 'เคล็ดลับให้ตัวเลขแม่น', en: 'Tips for accurate numbers' }}>
        <Items items={[
          { icon: 'camera', title: { th: 'ถ่ายใบแจ้งหนี้ให้ชัด', en: 'Take a clear picture of the statement' }, text: { th: 'ให้เห็นทั้งบรรทัดที่มียอดคงเหลือและยอดขั้นต่ำ ไม่เอียง ไม่สะท้อนแสง', en: 'Show the whole balance and minimum lines, straight and without glare.' } },
          { icon: 'check2-square', title: { th: 'ตรวจทุกตัวเลขก่อนบันทึก', en: 'Check every number before you save' }, text: { th: 'เทียบกับบรรทัดต้นฉบับที่แสดง แก้ได้ทันที', en: 'Compare with the source line shown, and fix it on the spot.' } },
          { icon: 'house-door', title: { th: 'กรอกค่าใช้จ่ายจำเป็น', en: 'Fill in your essentials' }, text: { th: 'ถ้าไม่กรอก แผนจะไม่รู้ว่าต้องกันเงินไว้เท่าไร', en: 'Without it the plan does not know how much to protect.' } },
          { icon: 'receipt-cutoff', title: { th: 'บอกบิลก้อนใหญ่ของเดือน', en: 'Tell it about a big bill this month' }, text: { th: 'พิมพ์ในแชต เช่น ค่าเทอม 15,000 แล้วกดใช้ค่านี้ แผนจะปรับให้', en: 'Type it in the chat, for example tuition 15,000, and press apply. The plan adjusts.' } },
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
    ['receipt', { th: 'หน้าภาษีพร้อมรายการลดหย่อน ใช้กฎของกรมสรรพากรปี 2568', en: 'A tax page with allowances, using the Revenue Department rules for 2568.' }],
    ['graph-up-arrow', { th: 'หน้าลงทุนแสดงราคาและปริมาณเหรียญจริง และปฏิทินปลดล็อกตัวอย่าง', en: 'An invest page with real token prices and supply, and a sample unlock calendar.' }],
    ['translate', { th: 'ภาษาไทยและอังกฤษ สลับได้ทุกหน้า', en: 'Thai and English, switchable on every page.' }],
  ]
  return (
    <PublicPage title={{ th: 'ช่วยเหลือ', en: 'Support' }} sub={{ th: 'คู่มือ บันทึกการเปลี่ยนแปลง และช่องทางร่วมสร้าง', en: 'Help, release notes and ways to get involved.' }}>
      <Items items={[
        { icon: 'book', title: { th: 'อ่านคู่มือ', en: 'Read the guide' }, text: { th: 'ทุกส่วนของแอปทีละขั้น', en: 'Every part of the app, step by step.' }, to: '/guide' },
        { icon: 'rocket-takeoff', title: { th: 'เริ่มต้นใช้งาน', en: 'Get started' }, text: { th: 'สี่ขั้นตอนถึงแผนแรก และสิ่งที่ควรเตรียม', en: 'Four steps to your first plan, and what to prepare.' }, to: '/start' },
        { icon: 'download', title: { th: 'ใช้งานแอป', en: 'Get the app' }, text: { th: 'เปิดในเบราว์เซอร์และเพิ่มลงหน้าจอหลัก', en: 'Open it in a browser and add it to your home screen.' }, to: '/install' },
        { icon: 'life-preserver', title: { th: 'แก้ปัญหาที่พบบ่อย', en: 'Fix common problems' }, text: { th: 'แชตขึ้นข้อผิดพลาด ตัวเลขไม่ตรง อ่านเอกสารผิด และอื่นๆ', en: 'Chat errors, numbers that look wrong, a misread statement and more.' }, to: '/guide#faq' },
        { icon: 'people', title: { th: 'เข้าร่วมชุมชน', en: 'Join the community' }, text: { th: 'ส่งความเห็นและช่วยกันทำให้ดีขึ้น', en: 'Share feedback and help make it better.' }, to: '/community' },
      ]} />
      <Block id="prototype" title={{ th: 'Debtwise ยังเป็นต้นแบบ', en: 'Debtwise is a prototype' }} text={{ th: 'ใช้งานได้ แต่ยังอยู่ระหว่างทดสอบ ตัวเลขทุกจุดควรตรวจก่อนตัดสินใจ', en: 'It works, but it is still being tested. Check every number before you decide anything.' }}>
        <Items items={[
          { icon: 'box', title: { th: 'บางส่วนเป็นตัวอย่าง', en: 'Some parts use sample data' }, text: { th: 'วันปลดล็อกโทเคนและข้อเสนอรีไฟแนนซ์เป็นข้อมูลตัวอย่างและมีป้ายกำกับ ภาษีใช้กฎจริงของกรมสรรพากร', en: 'Token unlock dates and refinance offers are sample data and labelled. Tax uses the real Revenue Department rules.' } },
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

export { Guide, Terms, Privacy } from './docs'
