import { useEffect, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Icon } from '../ui'
import { PublicPage, useL, type B } from './Site'

type Sec = { id: string; title: B; body: ReactNode }

// bare: only the text, no page frame, so onboarding can show the real document in a modal.
function Doc({ title, sub, sections, bare }: { title: B; sub: B; sections: Sec[]; bare?: boolean }) {
  const L = useL()
  useEffect(() => {
    if (bare) return
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
  }, [bare])
  const text = sections.map((s) => <section key={s.id} id={bare ? undefined : s.id} className="doc prose"><h2>{L(s.title)}</h2>{s.body}</section>)
  if (bare) return <>{text}</>
  return (
    <PublicPage title={title} sub={sub}>
      <nav className="chips plain" aria-label="Contents">
        {sections.map((s) => <Link key={s.id} to={`#${s.id}`}>{L(s.title)}</Link>)}
      </nav>
      {text}
    </PublicPage>
  )
}

const Note = ({ icon = 'info-circle', children }: { icon?: string; children: ReactNode }) => <div className="note"><Icon n={icon} /><p>{children}</p></div>
const P = ({ b }: { b: B }) => { const L = useL(); return <p>{L(b)}</p> }
const H = ({ b }: { b: B }) => { const L = useL(); return <h3>{L(b)}</h3> }
const Ul = ({ items }: { items: B[] }) => { const L = useL(); return <ul>{items.map((i) => <li key={i.en}>{L(i)}</li>)}</ul> }
const Ol = ({ items }: { items: B[] }) => { const L = useL(); return <ol>{items.map((i) => <li key={i.en}>{L(i)}</li>)}</ol> }
const Table = ({ head, rows }: { head: [B, B] | [B, B, B]; rows: (B[])[] }) => {
  const L = useL()
  return (
    <div className="tablewrap"><table>
      <thead><tr>{head.map((h) => <th key={h.en}>{L(h)}</th>)}</tr></thead>
      <tbody>{rows.map((r) => <tr key={r[0].en}>{r.map((c) => <td key={c.en}>{L(c)}</td>)}</tr>)}</tbody>
    </table></div>
  )
}
const Q = ({ q, a }: { q: B; a: B }) => { const L = useL(); return <><h3>{L(q)}</h3><p>{L(a)}</p></> }

/* =========================================================== Guide */
export function Guide() {
  const L = useL()
  const sections: Sec[] = [
    { id: 'overview', title: { th: 'ภาพรวม', en: 'Overview' }, body: <>
      <p className="lead">{L({ th: 'Debtwise ช่วยให้คนทั่วไปเห็นหนี้ทั้งหมดในที่เดียว เข้าใจว่าจ่ายไหวเท่าไร เช็กว่ารีไฟแนนซ์คุ้มไหม และคุยเรื่องเดือนที่ยาก', en: 'Debtwise helps a normal person see every debt in one place, understand what they can pay, check whether refinancing is worth it, and talk through a hard month.' })}</p>
      <P b={{ th: 'แอปมีหกแท็บ ได้แก่ หน้าหลัก แชต ลงทุน ภาษี หนี้ และโปรไฟล์ แต่ละแท็บมีคำอธิบายสั้นๆ ใต้ชื่อหน้า', en: 'The app has six tabs: Home, Chat, Invest, Tax, Debt and Profile. Each page has a short description under its title.' }} />
      <H b={{ th: 'หลักการสามข้อ', en: 'Three principles' }} />
      <Ol items={[
        { th: 'ตัวเลขทุกตัวคำนวณในโปรแกรม ไม่ใช่โดย AI AI อ่านเอกสารและอธิบายตัวเลขที่โปรแกรมคำนวณแล้วเท่านั้น', en: 'Every number is computed in the app, not by the AI. The AI reads documents and explains numbers the app already computed.' },
        { th: 'คุณยืนยันก่อนบันทึกเสมอ ตัวเลขที่ AI อ่านจากเอกสารจะไม่ถูกบันทึกจนกว่าคุณจะตรวจและติ๊กยืนยัน', en: 'You confirm before anything is saved. Numbers the AI reads from a document are not saved until you check and tick them.' },
        { th: 'ข้อมูลเป็นของคุณ คุณส่งออกหรือลบได้เอง และ Debtwise ไม่ย้ายเงินของคุณ', en: 'Your data is yours. You can export or delete it, and Debtwise never moves your money.' },
      ]} />
      <Note icon="exclamation-triangle">{L({ th: 'Debtwise เป็นต้นแบบ ให้ข้อมูลและตัวเลขประมาณการ ไม่ใช่คำแนะนำทางการเงิน ภาษี หรือกฎหมาย', en: 'Debtwise is a prototype. It gives information and estimates, not financial, tax or legal advice.' })}</Note>
    </> },

    { id: 'signin', title: { th: 'เข้าสู่ระบบ', en: 'Sign in' }, body: <>
      <P b={{ th: 'เลือกเข้าสู่ระบบด้วย Google หรือกรอกอีเมลเพื่อรับลิงก์เข้าสู่ระบบ ไม่มีรหัสผ่านให้จำ', en: 'Continue with Google, or enter your email to get a sign in link. There is no password to remember.' }} />
      <Ul items={[
        { th: 'Google: ระบบได้รับอีเมลและรูปโปรไฟล์ของบัญชี Google เพื่อแสดงชื่อและรูปในแถบด้านข้าง', en: 'Google: the app receives the email and profile picture of your Google account, to show your name and photo in the sidebar.' },
        { th: 'อีเมล: เปิดลิงก์ที่ส่งไปในเบราว์เซอร์เครื่องเดียวกัน ลิงก์ใช้ได้ครั้งเดียวและหมดอายุเอง', en: 'Email: open the link we send in the same browser. The link works once and expires on its own.' },
        { th: 'ข้อมูลของแต่ละบัญชีแยกจากกัน และเห็นได้เฉพาะเจ้าของบัญชี', en: 'Each account has its own data, visible only to its owner.' },
      ]} />
      <P b={{ th: 'ออกจากระบบได้จากไอคอนลูกศรออกที่มุมขวาบน หรือจากแถบด้านข้างบนคอมพิวเตอร์ หรือจากหน้าโปรไฟล์', en: 'Sign out with the arrow icon at the top right, from the sidebar on a computer, or from the Profile page.' }} />
    </> },

    { id: 'profile', title: { th: 'ตั้งค่าโปรไฟล์', en: 'Set up your profile' }, body: <>
      <P b={{ th: 'ครั้งแรกคุณจะตอบห้าขั้นสั้นๆ ก่อนเข้าแอป แต่ละขั้นมีไอคอนใหญ่และแถบความคืบหน้า คุณย้อนกลับได้ และแก้ไขทุกอย่างได้ภายหลังในหน้าโปรไฟล์', en: 'The first time, you answer five short steps before the app opens. Each step has a big icon and a progress bar. You can go back, and change everything later in Profile.' }} />
      <Table head={[{ th: 'ขั้น', en: 'Step' }, { th: 'ข้อมูลที่ถาม', en: 'What it asks' }, { th: 'ใช้ทำอะไร', en: 'What it is for' }]} rows={[
        [{ th: '1 เกี่ยวกับคุณ', en: '1 About you' }, { th: 'ชื่อ ปีเกิด จำนวนคนที่พึ่งรายได้ของคุณ', en: 'Name, birth year, people who depend on your income' }, { th: 'ทักทายคุณ ตรวจอายุเลิกทำงาน และปิดชื่อก่อนส่งข้อความให้ AI', en: 'Greets you, checks the retirement age, and removes your name before text goes to the AI' }],
        [{ th: '2 รายได้', en: '2 Income' }, { th: 'ประเภทรายได้ รายได้ต่อเดือน รายได้อื่น วันที่เงินเข้า', en: 'Income type, monthly income, other income, pay day' }, { th: 'คำนวณเงินที่เหลือและประมาณภาษี', en: 'Works out what is left and estimates tax' }],
        [{ th: '3 ช่วงเวลาทำงาน', en: '3 Work horizon' }, { th: 'อายุที่วางแผนเลิกทำงาน รายได้หลังจากนั้น (ไม่บังคับ)', en: 'Age you plan to stop working, income after that (optional)' }, { th: 'ภาพรวมระยะยาว', en: 'A longer view' }],
        [{ th: '4 ค่าใช้จ่ายจำเป็น', en: '4 Essentials' }, { th: 'ค่าเช่า อาหาร ค่าเทอม ต่อเดือน (ไม่บังคับ)', en: 'Rent, food, school fees per month (optional)' }, { th: 'แผนจะกันเงินส่วนนี้ไว้ก่อนจ่ายหนี้', en: 'The plan protects this before paying debt' }],
        [{ th: '5 หนี้', en: '5 Debts' }, { th: 'เพิ่มตอนนี้หรือไว้ทีหลัง', en: 'Add them now or later' }, { th: 'เริ่มสร้างแผน', en: 'Starts the plan' }],
      ]} />
      <P b={{ th: 'ปีเกิด รายได้ต่อเดือน และอายุเลิกทำงานเป็นข้อมูลที่ต้องกรอก ระบบตรวจว่าปีเกิดสมเหตุสมผลและอายุเลิกทำงานมากกว่าอายุปัจจุบัน', en: 'Birth year, monthly income and retirement age are required. The app checks that the birth year makes sense and that the retirement age is above your current age.' }} />
    </> },

    { id: 'add', title: { th: 'เพิ่มหนี้', en: 'Add debts' }, body: <>
      <P b={{ th: 'ไปที่แท็บหนี้แล้วกดเครื่องหมายบวก มีสามทาง', en: 'Open the Debt tab and press the plus. There are three ways.' }} />
      <H b={{ th: 'อัปโหลดใบแจ้งหนี้', en: 'Upload a statement' }} />
      <Ul items={[
        { th: 'รองรับรูปถ่ายและ PDF PDF ต้องไม่เกินประมาณ 3 MB รูปจะถูกย่อให้ด้านยาวไม่เกิน 1,600 พิกเซลก่อนส่ง', en: 'Photos and PDFs work. A PDF must be under about 3 MB. Photos are shrunk to 1,600 pixels on the long side before sending.' },
        { th: 'ไฟล์ถูกส่งให้ AI เพื่ออ่านค่าเท่านั้น ไม่ถูกเก็บ เก็บเฉพาะค่าที่คุณยืนยันและบรรทัดต้นฉบับ', en: 'The file goes to the AI only to read its values. It is not stored. Only the values you confirm and the source line are kept.' },
        { th: 'รูปและ PDF ปิดข้อมูลส่วนตัวก่อนส่งไม่ได้ หากต้องการ ให้บังเลขบัญชีหรือเลขบัตรก่อนถ่าย', en: 'Photos and PDFs cannot be masked before sending. If you prefer, cover account or ID numbers before you take the picture.' },
      ]} />
      <H b={{ th: 'พูดคุย', en: 'Talk it through' }} />
      <P b={{ th: 'เล่าให้ที่ปรึกษาฟังที่แท็บแชต ที่ปรึกษาเสนอเปลี่ยนค่าใช้จ่ายจำเป็นหรือบิลครั้งเดียวได้ แต่ยังไม่สร้างหนี้ให้ ใช้ฟอร์มหรืออัปโหลดสำหรับเพิ่มหนี้', en: 'Tell the consultant in the Chat tab. It can propose a change to your essentials or a one-off bill, but it does not create a debt for you. Use the form or an upload to add a debt.' }} />
      <H b={{ th: 'กรอกเอง', en: 'Enter by hand' }} />
      <Table head={[{ th: 'ช่อง', en: 'Field' }, { th: 'หมายเหตุ', en: 'Note' }]} rows={[
        [{ th: 'ผู้ให้กู้', en: 'Lender' }, { th: 'ต้องกรอก ใช้ชื่อธนาคารหรือผู้ให้กู้', en: 'Required. Bank or lender name.' }],
        [{ th: 'ประเภท', en: 'Type' }, { th: 'บัตรเครดิต สินเชื่อส่วนบุคคลและนาโน รถหรือมอเตอร์ไซค์ บ้าน กยศ. หนี้นอกระบบ', en: 'Credit card, personal and nano loan, car or motorbike, home, student loan, informal' }],
        [{ th: 'ยอดคงเหลือ', en: 'Balance' }, { th: 'ต้องกรอก มากกว่า 0', en: 'Required. Above 0.' }],
        [{ th: 'ดอกเบี้ยต่อปี', en: 'Interest per year' }, { th: 'ถ้าไม่ทราบ เว้นว่างได้ แผนจะถือว่า 0 ในการเรียงลำดับ', en: 'May be left empty. The plan treats it as 0 when ordering.' }],
        [{ th: 'ยอดชำระขั้นต่ำ', en: 'Minimum payment' }, { th: 'ต้องกรอก', en: 'Required.' }],
        [{ th: 'วันครบกำหนด', en: 'Due day' }, { th: 'วันที่ 29 ถึง 31 จะนับเป็นวันที่ 28 ในไฟล์ปฏิทินเพื่อให้ทุกเดือนมีวันนั้น', en: 'The 29th to 31st are moved to the 28th in the calendar file so every month has the date.' }],
        [{ th: 'เดือนที่เหลือ', en: 'Months left' }, { th: 'ต้องมีสำหรับเช็กรีไฟแนนซ์', en: 'Needed for the refinance check.' }],
      ]} />
      <P b={{ th: 'ประเภทหนี้ที่รองรับ: บัตรเครดิต สินเชื่อส่วนบุคคลและนาโน รถหรือมอเตอร์ไซค์ บ้าน กยศ. และหนี้นอกระบบ', en: 'Supported types: credit card, personal and nano loan, car or motorbike, home, student loan and informal debt.' }} />
    </> },

    { id: 'review', title: { th: 'ตรวจตัวเลขก่อนบันทึก', en: 'Check the numbers' }, body: <>
      <P b={{ th: 'หลังอัปโหลด คุณจะเห็นแต่ละรายการพร้อมบรรทัดต้นฉบับที่คัดลอกจากเอกสารและระดับความมั่นใจ', en: 'After an upload you see each item with the source line copied from your document and a confidence level.' }} />
      <Ol items={[
        { th: 'เทียบยอดคงเหลือ ดอกเบี้ย และยอดขั้นต่ำกับเอกสารของคุณ', en: 'Compare the balance, interest and minimum with your document.' },
        { th: 'แก้ตัวเลขที่ผิดได้ในช่อง', en: 'Fix any wrong number in its field.' },
        { th: 'ติ๊ก ตรงกับเอกสารของฉัน เฉพาะรายการที่ถูก', en: 'Tick "This matches my document" only on the ones that are right.' },
        { th: 'กดบันทึก เฉพาะรายการที่ติ๊กจะถูกบันทึก และมีป้าย ยืนยันแล้ว', en: 'Press save. Only ticked items are saved, and they get a "verified" badge.' },
      ]} />
      <Note icon="shield-check">{L({ th: 'เนื้อหาในเอกสารถือเป็นข้อมูล ไม่ใช่คำสั่ง ข้อความในไฟล์ที่พยายามสั่ง AI จะถูกเมิน เรามีการทดสอบกรณีนี้', en: 'Document content is treated as data, not instructions. Text in a file that tries to command the AI is ignored. This case is tested.' })}</Note>
      <P b={{ th: 'ถ้าไม่พบรายการ ลองรูปที่ชัดขึ้นหรือกรอกเอง', en: 'If nothing is found, try a clearer picture or enter it by hand.' }} />
    </> },

    { id: 'home', title: { th: 'หน้าหลัก', en: 'Home' }, body: <>
      <P b={{ th: 'หน้าหลังสรุปเดือนนี้ของคุณ', en: 'Home sums up your month.' }} />
      <Ul items={[
        { th: 'ส่วนหัว: ยอดที่เหลือหรือที่ขาดในเดือนนี้ และหนี้ที่ใกล้ครบกำหนดที่สุด', en: 'The top: what is left or short this month, and the debt due next.' },
        { th: 'รายการสรุป: รายได้ ค่าใช้จ่ายจำเป็น บิลครั้งเดียว ยอดผ่อนหนี้ขั้นต่ำ และภาษีที่กันไว้ต่อเดือน', en: 'The summary lines: income, essentials, one-off bills, minimum debt payments and tax set aside per month.' },
        { th: 'ปุ่ม: ดูแผน เพิ่มหนี้ ส่งออกวันครบกำหนดเป็นไฟล์ปฏิทิน .ics และล้างบิลครั้งเดียว', en: 'Buttons: see the plan, add a debt, export due dates as an .ics calendar file, and clear one-off bills.' },
        { th: 'ที่ใกล้ถึงกำหนด: ห้ารายการแรกเรียงตามวัน กดเพื่อเปิดรายละเอียด', en: 'Coming up: the next five, sorted by day. Tap one to open it.' },
      ]} />
      <P b={{ th: 'ในเดือนใหม่ครั้งแรกที่เปิดแอป ระบบบันทึกภาพรวมแผนของเดือนนั้นไว้ในบัญชีของคุณ', en: 'The first time you open the app in a new month, it saves a snapshot of that month’s plan to your account.' }} />
      <P b={{ th: 'ยอดที่ขาดคือ รายได้ ลบค่าจำเป็น ลบภาษีที่กันไว้ ลบยอดขั้นต่ำทุกก้อน ถ้าติดลบ แปลว่าเงินไม่พอจ่ายขั้นต่ำทั้งหมด', en: 'The shortfall is income, minus essentials, minus tax set aside, minus every minimum payment. If it is negative, the money does not cover all the minimums.' }} />
    </> },

    { id: 'chat', title: { th: 'แชตกับที่ปรึกษา', en: 'Chat with the consultant' }, body: <>
      <P b={{ th: 'แท็บแชตเป็นบทสนทนาเต็มหน้า ข้อความแรกมาจากตัวเลขของโปรแกรม พิมพ์ในช่องด้านล่าง หรือกดไมค์เพื่อพูด', en: 'The Chat tab is a full page conversation. The first line comes from the app’s numbers. Type in the bar at the bottom, or press the mic to speak.' }} />
      <H b={{ th: 'ที่ปรึกษาทำอะไรได้', en: 'What it can do' }} />
      <Ul items={[
        { th: 'อธิบายตัวเลขของคุณ เช่น ทำไมเดือนนี้ขาด และก้อนไหนจ่ายไม่ครบ', en: 'Explain your numbers, for example why this month is short and which loan goes unpaid.' },
        { th: 'บอกทางเลือก เช่น คุยกับผู้ให้กู้ก่อนพลาดการชำระ หรือโครงการช่วยเหลือของธนาคารแห่งประเทศไทย', en: 'List options, such as talking to the lender before a payment is missed, or Bank of Thailand relief programmes.' },
        { th: 'เสนอการเปลี่ยนแปลง เช่น ค่าใช้จ่ายจำเป็นใหม่ หรือบิลครั้งเดียวเดือนนี้ คุณกดใช้ค่านี้เพื่อยืนยัน', en: 'Propose a change, such as new essentials or a one-off bill this month. You press apply to confirm.' },
      ]} />
      <H b={{ th: 'บิลครั้งเดียว', en: 'One-off bills' }} />
      <P b={{ th: 'ถ้าคุณพิมพ์ ค่าเทอมลูก 15,000 บาทเดือนนี้ ที่ปรึกษาจะเสนอบิลครั้งเดียว 15,000 ตามที่คุณพิมพ์ เมื่อกดใช้ค่านี้ ยอดที่เหลือ แผน และหน้าหลักเปลี่ยนทันที และที่ปรึกษาตอบใหม่ด้วยตัวเลขล่าสุด บิลนี้นับเฉพาะเดือนนี้และเก็บในเบราว์เซอร์เครื่องนี้', en: 'If you type "tuition 15,000 baht this month", the consultant proposes a one-off bill of exactly 15,000. When you apply it, what is left, the plan and Home change at once, and the consultant answers again with the new numbers. The bill counts for this month only and is kept in this browser.' }} />
      <H b={{ th: 'แหล่งที่มาและคำเตือน', en: 'Sources and warnings' }} />
      <Ul items={[
        { th: 'เมื่อเอ่ยถึงโครงการช่วยเหลือ จะมีลิงก์แหล่งที่มาไปยังหน้าทางการของธนาคารแห่งประเทศไทยใต้ข้อความ', en: 'When it mentions a relief programme, a source link to the official Bank of Thailand page appears under the message.' },
        { th: 'ที่ปรึกษาไม่บอกว่าคุณมีสิทธิ์ในโครงการ เพราะขึ้นกับเงื่อนไขและการพิจารณาของเจ้าหนี้', en: 'It never says you qualify for a programme, because that depends on the terms and the creditor’s decision.' },
        { th: 'ถ้าคำตอบมีตัวเลขที่ไม่อยู่ในข้อมูลของคุณ แอปติดป้ายเตือนใต้ข้อความ', en: 'If a reply contains a figure that is not in your data, the app adds a warning under it.' },
        { th: 'ที่ปรึกษาไม่ย้ายเงินและไม่ติดต่อผู้ให้กู้แทนคุณ', en: 'It does not move money and does not contact your lender for you.' },
      ]} />
      <H b={{ th: 'เสียง', en: 'Voice' }} />
      <P b={{ th: 'ไมค์แปลงเสียงเป็นข้อความ และถ้าคุณพูด คำตอบอาจถูกอ่านออกเสียง เสียงและข้อความไปยังบริการเสียง ถ้าไม่สะดวกให้พิมพ์แทนได้เสมอ', en: 'The mic turns speech into text, and if you spoke, the reply may be read aloud. Audio and text go to the voice service. You can always type instead.' }} />
      <P b={{ th: 'ที่ปรึกษาเห็นข้อความล่าสุดสิบข้อความ และข้อมูลสรุปของคุณ (รายได้ ค่าจำเป็น หนี้ ผู้ให้กู้ ยอดคงเหลือ ดอกเบี้ย ยอดที่วางแผนจ่าย)', en: 'The consultant sees the last ten messages and a summary of your numbers (income, essentials, debts, lenders, balances, rates, planned payments).' }} />
      <Note icon="heart">{L({ th: 'ถ้าคุณพูดถึงการทำร้ายตัวเอง ที่ปรึกษาจะตอบด้วยความห่วงใย และควรโทรสายด่วนสุขภาพจิต 1323 ซึ่งให้บริการตลอด 24 ชั่วโมง', en: 'If you talk about hurting yourself, the consultant responds with care. Call the mental health hotline 1323, open 24 hours.' })}</Note>
    </> },

    { id: 'debt', title: { th: 'หน้าหนี้', en: 'The Debt tab' }, body: <>
      <P b={{ th: 'ส่วนหัวแสดงยอดค้างรวมและยอดชำระต่อเดือน สลับดูตามผู้ให้กู้หรือตามประเภท แต่ละบรรทัดแสดงจำนวนรายการและสัดส่วนของยอดรวม', en: 'The top shows the total owed and the monthly payments. Switch between lender and type. Each row shows the number of loans and its share of the total.' }} />
      <P b={{ th: 'ธนาคารไทยที่รู้จักมีไอคอนสีตามแบรนด์ เช่น กสิกรเขียว ไทยพาณิชย์ม่วง กรุงไทยฟ้า', en: 'Well known Thai banks get an icon in their brand colour, such as green for KBank, purple for SCB and light blue for Krungthai.' }} />
      <H b={{ th: 'หน้ารายละเอียดของหนี้', en: 'Loan details' }} />
      <Table head={[{ th: 'ป้าย', en: 'Badge' }, { th: 'ความหมาย', en: 'Meaning' }]} rows={[
        [{ th: 'ยืนยันแล้ว', en: 'Verified' }, { th: 'อ่านจากเอกสารและคุณตรวจกับบรรทัดต้นฉบับแล้ว', en: 'Read from a document and checked by you against the source line' }],
        [{ th: 'ต้องตรวจ', en: 'Needs review' }, { th: 'ความมั่นใจต่ำ ควรตรวจกับเอกสาร', en: 'Low confidence, check it against your document' }],
        [{ th: 'คุณระบุเอง', en: 'User stated' }, { th: 'คุณกรอกเอง ไม่มีเอกสารยืนยัน', en: 'You typed it, with no document to back it up' }],
        [{ th: 'ตัวอย่าง', en: 'Sample' }, { th: 'มาจากครอบครัวตัวอย่าง', en: 'Comes from the demo family' }],
      ]} />
      <P b={{ th: 'หน้ารายละเอียดยังบอกวันครบกำหนดถัดไป ระยะเวลาที่ต้องใช้ปิดหนี้ถ้าจ่ายแค่ขั้นต่ำ และดอกเบี้ยโดยประมาณตลอดช่วงนั้น ถ้ายอดขั้นต่ำน้อยกว่าดอกเบี้ยต่อเดือน แอปบอกว่าจ่ายขั้นต่ำอย่างเดียวไม่มีวันปิดหนี้', en: 'The detail page also shows the next due date, how long it takes to pay the loan off if you only pay the minimum, and about how much interest that costs. If the minimum is less than a month’s interest, it says paying only the minimum never clears the loan.' }} />
      <P b={{ th: 'แก้ไขได้ทุกช่อง และลบได้ การลบมีหน้าต่างยืนยันที่บอกว่าจะลบรายการไหน และย้อนกลับไม่ได้', en: 'Every field can be edited, and a loan can be deleted. Deleting shows a confirmation that names the loan, and it cannot be undone.' }} />
    </> },

    { id: 'plan', title: { th: 'แผนรายเดือน', en: 'Monthly plan' }, body: <>
      <P b={{ th: 'แผนกระจายเงินที่มีตามลำดับ', en: 'The plan spreads the money you have in order.' }} />
      <Ol items={[
        { th: 'กันค่าใช้จ่ายจำเป็นและภาษีที่ต้องกันไว้ก่อน', en: 'Protect essentials and the tax set aside first.' },
        { th: 'จ่ายขั้นต่ำให้ทุกก้อน เริ่มจากก้อนที่ดอกเบี้ยสูงสุด', en: 'Pay every minimum, starting with the highest interest rate.' },
        { th: 'เงินที่เหลือเพิ่มให้ก้อนที่ดอกเบี้ยสูงสุด (วิธี avalanche) จนปิดก้อนนั้นได้ แล้วไปก้อนถัดไป', en: 'Put what is left on the highest rate (the avalanche method) until it is cleared, then the next.' },
      ]} />
      <H b={{ th: 'ตัวอย่าง', en: 'Example' }} />
      <P b={{ th: 'มีเงินจ่ายหนี้ 12,000 บัตรเครดิต (ขั้นต่ำ 2,500 ดอกเบี้ย 16%) สินเชื่อส่วนบุคคล (ขั้นต่ำ 5,200 ดอกเบี้ย 25%) แผนจ่ายขั้นต่ำทั้งสองก้อนรวม 7,700 แล้วเพิ่ม 4,300 ให้สินเชื่อส่วนบุคคลเพราะดอกเบี้ยสูงกว่า', en: 'You have 12,000 for debt: a credit card (minimum 2,500, interest 16%) and a personal loan (minimum 5,200, interest 25%). The plan pays both minimums, 7,700 in all, then adds 4,300 to the personal loan because its rate is higher.' }} />
      <H b={{ th: 'เหตุผลที่แสดงในแต่ละบรรทัด', en: 'The reason shown on each line' }} />
      <Table head={[{ th: 'เหตุผล', en: 'Reason' }, { th: 'ความหมาย', en: 'Meaning' }]} rows={[
        [{ th: 'ชำระขั้นต่ำ', en: 'Minimum payment' }, { th: 'จ่ายครบขั้นต่ำ', en: 'The full minimum is covered' }],
        [{ th: 'ชำระขั้นต่ำได้บางส่วน', en: 'Part of the minimum' }, { th: 'เงินหมดก่อนครบขั้นต่ำ', en: 'Money ran out before the minimum' }],
        [{ th: 'เพิ่มให้ดอกเบี้ยสูงสุดก่อน', en: 'Extra, highest interest first' }, { th: 'ได้เงินส่วนที่เหลือ', en: 'Gets the leftover money' }],
        [{ th: 'เดือนนี้ยังจ่ายไม่ได้', en: 'Not covered this month' }, { th: 'ไม่มีเงินเหลือสำหรับก้อนนี้', en: 'No money is left for it' }],
      ]} />
      <P b={{ th: 'ถ้าเงินไม่พอ แผนบอกว่าขาดเท่าไรและก้อนไหนจ่ายไม่ครบ ควรคุยกับผู้ให้กู้ก่อนพลาดการชำระ กดบันทึกแผนนี้เพื่อเก็บภาพรวมของเดือน', en: 'If money is short, the plan shows by how much and which loans go unpaid. Talk to your lender before a payment is missed. Press save to keep the month’s snapshot.' }} />
      <H b={{ th: 'ข้อความถึงผู้ให้กู้', en: 'A message to your lender' }} />
      <P b={{ th: 'เมื่อเดือนนั้นขาด หน้าแผนมีปุ่ม ร่างข้อความ ระบบร่างคำขอปรับโครงสร้างหนี้ถึงผู้ให้กู้ของก้อนที่เสี่ยงที่สุด โดยใส่ยอดคงเหลือ ยอดขั้นต่ำ เงินที่มี และยอดที่ขาดของคุณให้ ร่างนี้เขียนจากแม่แบบ ไม่ได้ใช้ AI และไม่แต่งตัวเลขเอง คุณแก้ไขและส่งเองทางช่องทางของผู้ให้กู้ แอปไม่ส่งแทน', en: 'When the month is short, the Plan page has a "Draft a message" button. It writes a request to restructure, to the lender of the loan most at risk, with your balance, minimum, available money and shortfall filled in. The draft comes from a template, not from AI, and invents no numbers. You edit it and send it yourself through your lender’s channels. The app does not send it.' }} />
    </> },

    { id: 'refinance', title: { th: 'เช็กรีไฟแนนซ์', en: 'Refinance check' }, body: <>
      <P b={{ th: 'ในหน้าแผน ระบบเทียบข้อเสนอตัวอย่างกับหนี้ที่มีดอกเบี้ยและเดือนที่เหลือครบ', en: 'On the Plan page the app compares sample offers with every loan that has an interest rate and months left.' }} />
      <Ol items={[
        { th: 'คำนวณยอดผ่อนต่อเดือนของหนี้เดิมจากยอดคงเหลือ ดอกเบี้ย และเดือนที่เหลือ', en: 'It works out the current monthly payment from the balance, rate and months left.' },
        { th: 'คำนวณยอดผ่อนใหม่ตามข้อเสนอ แล้วบวกค่าธรรมเนียม ค่าปรับ และเบี้ยประกันรายเดือนตลอดอายุสัญญา', en: 'It works out the new payment from the offer, then adds the fee, the penalty and monthly insurance over the whole term.' },
        { th: 'ส่วนต่างสุทธิคือต้นทุนรวมเดิม ลบต้นทุนรวมใหม่ ถ้าเป็นบวก การเปลี่ยนมีต้นทุนต่ำกว่า', en: 'The net difference is the old total cost minus the new total cost. If it is positive, switching costs less.' },
      ]} />
      <Ul items={[
        { th: 'ถ้าสัญญาใหม่ยาวกว่าที่เหลือ แอปเตือนว่าระยะเวลายาวขึ้น ซึ่งอาจทำให้จ่ายดอกเบี้ยรวมมากขึ้นแม้ยอดผ่อนลด', en: 'If the new term is longer than what you have left, the app warns that it is longer, which can mean more interest overall even with a lower payment.' },
        { th: 'ข้อเสนอที่แสดงเป็นข้อมูลตัวอย่างและมีป้ายกำกับ ใช้ดูวิธีเทียบ ไม่ใช่ข้อเสนอจริงของธนาคาร', en: 'The offers shown are sample data and are labelled. They show how the comparison works and are not real bank offers.' },
        { th: 'ข้อเสนอจริงต้องดูเงื่อนไขอื่นด้วย เช่น ช่วงโปรโมชันและเงื่อนไขการอนุมัติ ซึ่งแอปยังไม่ได้คำนวณ', en: 'A real offer has other terms, such as promotional periods and approval conditions, which the app does not model yet.' },
      ]} />
    </> },

    { id: 'tax', title: { th: 'ภาษี', en: 'Tax' }, body: <>
      <P b={{ th: 'หน้าภาษีประมาณภาษีเงินได้บุคคลธรรมดาจากรายได้ต่อปีของคุณ (รายได้ต่อเดือนรวมรายได้อื่น คูณสิบสอง) โดยใช้กฎที่กรมสรรพากรเผยแพร่สำหรับปีภาษี 2568 ซึ่งเป็นชุดล่าสุดที่มีเอกสารทางการ', en: 'The Tax page estimates personal income tax from your yearly income (monthly income plus other income, times twelve) using the rules the Revenue Department published for tax year 2568, the latest official set.' }} />
      <Ol items={[
        { th: 'หักค่าใช้จ่ายร้อยละ 50 ของรายได้ แต่ไม่เกิน 100,000 บาท', en: 'Deduct 50% of income as expenses, at most 100,000 baht.' },
        { th: 'หักค่าลดหย่อนส่วนตัว 60,000 บาท', en: 'Deduct the personal allowance of 60,000 baht.' },
        { th: 'คำนวณตามขั้นอัตราก้าวหน้า: ถึง 150,000 ยกเว้น แล้ว 5% 10% 15% 20% 25% 30% และ 35% เมื่อเกิน 5 ล้านบาท', en: 'Apply the progressive bands: exempt up to 150,000, then 5%, 10%, 15%, 20%, 25%, 30%, and 35% above 5 million baht.' },
        { th: 'หารด้วยสิบสองเป็นภาษีที่กันไว้ต่อเดือน ซึ่งนำไปรวมในหน้าหลัก แผน และแชต', en: 'Divide by twelve for the monthly tax set aside, which feeds Home, the plan and the chat.' },
      ]} />
      <H b={{ th: 'ค่าลดหย่อนที่แสดง', en: 'Allowances shown' }} />
      <P b={{ th: 'หน้านี้ลิสต์ค่าลดหย่อนที่อาจใช้ได้และประมาณว่าแต่ละรายการอาจประหยัดภาษีได้สูงสุดเท่าไร (ค่าลดหย่อนสูงสุด คูณอัตราภาษีขั้นสูงสุดของคุณ) พร้อมเอกสารที่ต้องเก็บ', en: 'It lists allowances you may be able to claim and the most each could save (the maximum allowance times your top tax rate), with the paperwork to keep.' }} />
      <Table head={[{ th: 'รายการ', en: 'Item' }, { th: 'สูงสุด (บาท)', en: 'Most (baht)' }]} rows={[
        [{ th: 'คู่สมรสที่ไม่มีเงินได้', en: 'Spouse with no income' }, { th: '60,000', en: '60,000' }],
        [{ th: 'บุตร ต่อคน', en: 'Child, each' }, { th: '30,000 (บุตรคนที่สองขึ้นไปที่เกิดตั้งแต่ปี 2561 เพิ่มอีก 30,000)', en: '30,000 (30,000 more for a second or later child born from 2018)' }],
        [{ th: 'บิดามารดา ต่อคน', en: 'Parents, each' }, { th: '30,000', en: '30,000' }],
        [{ th: 'เงินสมทบประกันสังคม', en: 'Social security' }, { th: '9,000', en: '9,000' }],
        [{ th: 'เบี้ยประกันชีวิต', en: 'Life insurance' }, { th: '100,000', en: '100,000' }],
        [{ th: 'เบี้ยประกันสุขภาพ', en: 'Health insurance' }, { th: '25,000 (รวมกับประกันชีวิตไม่เกิน 100,000)', en: '25,000 (with life insurance, 100,000 at most)' }],
        [{ th: 'ดอกเบี้ยเงินกู้ซื้อที่อยู่อาศัย', en: 'Home loan interest' }, { th: '100,000', en: '100,000' }],
        [{ th: 'ค่าฝากครรภ์และคลอดบุตร', en: 'Prenatal care and childbirth' }, { th: '60,000 ต่อการตั้งครรภ์', en: '60,000 per pregnancy' }],
      ]} />
      <Note icon="exclamation-triangle">{L({ th: 'เป็นการประมาณ ไม่ใช่การคำนวณเพื่อยื่นแบบ เงื่อนไขอายุ รายได้ และลำดับบุตรมีในแบบ ภ.ง.ด. ฟรีแลนซ์และรายได้หลายประเภทอาจใช้กฎค่าใช้จ่ายต่างออกไป ตรวจกับแบบทางการและกรมสรรพากรก่อนยื่น', en: 'This is an estimate, not a filing calculation. Conditions on age, income and the order of children are on the official form. Freelance and mixed income may use different expense rules. Check the official form and the Revenue Department before you file.' })}</Note>
      <P b={{ th: 'Debtwise ไม่ยื่นภาษีแทนคุณ', en: 'Debtwise does not file taxes for you.' }} />
    </> },

    { id: 'invest', title: { th: 'ลงทุน', en: 'Invest' }, body: <>
      <Ul items={[
        { th: 'ตลาดตอนนี้: ราคาเป็นบาท การเปลี่ยนแปลง 24 ชั่วโมง และส่วนของเหรียญที่ยังไม่หมุนเวียนของโทเคนที่มีตารางปลดล็อก (Sui, Arbitrum, Aptos, Starknet, Celestia, Optimism) ข้อมูลจริงจาก CoinGecko อัปเดตทุกไม่กี่นาที', en: 'Market now: prices in baht, the 24 hour change, and the share of supply not yet in circulation for tokens with unlock schedules (Sui, Arbitrum, Aptos, Starknet, Celestia, Optimism). Real data from CoinGecko, refreshed every few minutes.' },
        { th: 'ปฏิทินปลดล็อก: วันที่และปริมาณเป็นข้อมูลตัวอย่างของโทเคนสมมติ และมีป้ายกำกับ ตัวอย่าง เพราะยังไม่มีแหล่งข้อมูลจริงที่ใช้ได้', en: 'Unlock calendar: the dates and amounts are sample data for made-up tokens and are labelled sample, because there is no real source in use yet.' },
        { th: 'แถบด้านบนบอกเงินที่เหลือหลังหนี้ ค่าจำเป็น และภาษีในเดือนนี้ เพื่อให้เห็นภาพ ก่อนคิดเรื่องลงทุน', en: 'The line at the top tells you what is left after debt, essentials and tax this month, so you can see the picture before thinking about investing.' },
      ]} />
      <Note icon="exclamation-triangle">{L({ th: 'ให้ข้อมูลเท่านั้น ไม่ใช่คำแนะนำให้ซื้อหรือขาย การปลดล็อกไม่ได้บอกว่าราคาจะขึ้นหรือลง คริปโตมีความเสี่ยงสูง และเงินที่ต้องใช้จ่ายหนี้หรือค่าเทอมไม่ควรนำไปลงทุน', en: 'Information only, not advice to buy or sell. An unlock does not tell you whether a price will rise or fall. Crypto is high risk, and money you need for debt or tuition should not be invested.' })}</Note>
    </> },

    { id: 'profile-page', title: { th: 'โปรไฟล์และข้อมูลของคุณ', en: 'Profile and your data' }, body: <>
      <Ul items={[
        { th: 'แก้ข้อมูลส่วนตัว รายได้ อายุเลิกทำงาน และค่าใช้จ่ายจำเป็น แล้วกดบันทึก', en: 'Edit your details, income, retirement age and essentials, then press save.' },
        { th: 'ภาษา: ไทยหรืออังกฤษ ใช้ทุกหน้า และจำไว้ในเบราว์เซอร์และบัญชี', en: 'Language: Thai or English, on every page, remembered in the browser and your account.' },
        { th: 'ส่งออกสำเนา: ไฟล์ JSON ของโปรไฟล์ หนี้ แหล่งที่มา แผน และข้อความ', en: 'Export a copy: a JSON file of your profile, debts, sources, plans and messages.' },
        { th: 'โหลดครอบครัวตัวอย่าง และลบข้อมูลสาธิต: เพิ่มหรือลบหนี้ตัวอย่างหกรายการเพื่อลองใช้', en: 'Load demo family and remove demo data: adds or removes six sample debts so you can try the app.' },
        { th: 'ลบข้อมูลทั้งหมดของฉัน: ต้องพิมพ์ delete เพื่อยืนยัน ลบโปรไฟล์ หนี้ แหล่งที่มา แผน และข้อความ และล้างบิลครั้งเดียวในเบราว์เซอร์นี้', en: 'Delete all my data: you must type delete to confirm. It removes your profile, debts, sources, plans and messages, and clears the one-off bills in this browser.' },
      ]} />
      <P b={{ th: 'การลบข้อมูลไม่ลบบัญชีเข้าสู่ระบบ (อีเมลหรือบัญชี Google) ดูรายละเอียดในนโยบายความเป็นส่วนตัว', en: 'Deleting your data does not delete the sign in account (email or Google). See the privacy policy for details.' }} />
      <p><Link className="link" to="/privacy">{L({ th: 'อ่านนโยบายความเป็นส่วนตัว', en: 'Read the privacy policy' })}</Link></p>
    </> },

    { id: 'phone', title: { th: 'ใช้บนมือถือและคอมพิวเตอร์', en: 'Phone and computer' }, body: <>
      <Ul items={[
        { th: 'มือถือและแท็บเล็ต: แถบไอคอนด้านล่างพร้อมชื่อใต้ไอคอน', en: 'Phone and tablet: an icon bar at the bottom with a name under each icon.' },
        { th: 'คอมพิวเตอร์: แถบด้านข้างพร้อมบัญชีของคุณ เมนู รายชื่อผู้ให้กู้ และทางลัด', en: 'Computer: a sidebar with your account, the menu, a list of lenders and shortcuts.' },
        { th: 'เพิ่มลงหน้าจอหลักเพื่อเปิดเต็มจอเหมือนแอป ดูขั้นตอนในหน้าใช้งานแอป', en: 'Add it to your home screen to open full screen like an app. The steps are on the Get the app page.' },
        { th: 'ต้องมีอินเทอร์เน็ต เพราะข้อมูลอยู่ในบัญชีออนไลน์ของคุณ', en: 'You need an internet connection, because your data lives in your online account.' },
      ]} />
    </> },

    { id: 'limits', title: { th: 'สิ่งที่ Debtwise ไม่ทำ', en: 'What Debtwise does not do' }, body: <Ul items={[
      { th: 'ไม่มีบัญชีเงินหรือการโอนเงิน', en: 'No money account and no payments.' },
      { th: 'ไม่เชื่อมบัญชีธนาคารหรือเครดิตบูโรโดยตรง', en: 'No live bank or credit bureau connection.' },
      { th: 'ไม่ยื่นภาษีและไม่ซื้อขายสินทรัพย์ให้', en: 'No tax filing and no trading.' },
      { th: 'ไม่ติดต่อผู้ให้กู้แทนคุณ และไม่รับรองว่าผู้ให้กู้จะอนุมัติอะไร', en: 'No contacting lenders for you, and no promise that a lender will approve anything.' },
      { th: 'ไม่ให้คำแนะนำทางการเงิน ภาษี กฎหมาย หรือการลงทุน', en: 'No financial, tax, legal or investment advice.' },
    ]} /> },

    { id: 'faq', title: { th: 'ปัญหาที่พบบ่อย', en: 'Troubleshooting' }, body: <>
      <Q q={{ th: 'แชตขึ้นว่าเกิดข้อผิดพลาด', en: 'The chat says something went wrong' }} a={{ th: 'ลองส่งใหม่ เซสชันอาจหมดอายุ ให้ออกจากระบบแล้วเข้าใหม่ หากเกิดซ้ำ บริการ AI อาจไม่ว่างชั่วคราว ระบบลองซ้ำให้สองครั้งแล้ว', en: 'Send it again. Your session may have expired, so sign out and back in. If it keeps happening, the AI service may be busy. The app already retries twice.' }} />
      <Q q={{ th: 'ตัวเลขเดือนนี้ดูไม่ถูก', en: 'This month’s numbers look wrong' }} a={{ th: 'ตรวจรายได้และค่าใช้จ่ายจำเป็นในโปรไฟล์ ตรวจว่ายอดชำระขั้นต่ำของแต่ละหนี้ถูก และดูว่ามีบิลครั้งเดียวค้างอยู่หรือไม่ (ล้างได้ที่หน้าหลัก)', en: 'Check income and essentials in Profile, check each debt’s minimum payment, and see whether a one-off bill is still counted (you can clear it on Home).' }} />
      <Q q={{ th: 'AI อ่านใบแจ้งหนี้ผิด', en: 'The AI misread my statement' }} a={{ th: 'แก้ตัวเลขในหน้าตรวจก่อนบันทึก ใช้รูปที่ชัด ไม่เอียง และเห็นทั้งบรรทัดที่มียอดคงเหลือ หรือกรอกเองด้วยฟอร์ม', en: 'Fix the number on the review screen before saving. Use a clear, straight picture that shows the whole balance line, or enter it with the form.' }} />
      <Q q={{ th: 'บิลครั้งเดียวหายไปเมื่อเปิดบนเครื่องอื่น', en: 'My one-off bill is gone on another device' }} a={{ th: 'บิลครั้งเดียวเก็บในเบราว์เซอร์เครื่องนั้น และนับเฉพาะเดือนนั้น จึงไม่ตามไปเครื่องอื่นหรือเดือนถัดไป', en: 'One-off bills are kept in the browser on that device and count for that month only, so they do not follow you to another device or into the next month.' }} />
      <Q q={{ th: 'เปลี่ยนภาษาไม่ได้บนมือถือ', en: 'I cannot find the language switch on my phone' }} a={{ th: 'เมื่อเข้าสู่ระบบแล้ว ภาษาอยู่ในหน้าโปรไฟล์ ก่อนเข้าสู่ระบบมีปุ่ม TH และ EN ที่มุมขวาบน', en: 'After you sign in, the language is in Profile. Before you sign in there is a TH and EN switch at the top right.' }} />
      <Q q={{ th: 'อยากเลิกใช้และลบทุกอย่าง', en: 'I want to stop and delete everything' }} a={{ th: 'ใช้ ลบข้อมูลทั้งหมดของฉัน ในหน้าโปรไฟล์ ถ้าต้องการลบบัญชีเข้าสู่ระบบด้วย ดูนโยบายความเป็นส่วนตัว', en: 'Use "Delete all my data" in Profile. To remove the sign in account as well, see the privacy policy.' }} />
    </> },

    { id: 'glossary', title: { th: 'คำศัพท์', en: 'Glossary' }, body: <Table head={[{ th: 'คำ', en: 'Term' }, { th: 'ความหมาย', en: 'Meaning' }]} rows={[
      [{ th: 'ยอดชำระขั้นต่ำ', en: 'Minimum payment' }, { th: 'จำนวนต่ำสุดที่ต้องจ่ายต่อเดือนเพื่อไม่ให้ผิดนัด', en: 'The least you must pay each month to avoid being late' }],
      [{ th: 'ยอดที่ขาด', en: 'Shortfall' }, { th: 'ส่วนที่เงินไม่พอจ่ายขั้นต่ำทั้งหมดในเดือนนั้น', en: 'The amount by which money does not cover all the minimums that month' }],
      [{ th: 'ค่าใช้จ่ายจำเป็น', en: 'Essentials' }, { th: 'ค่าเช่า อาหาร ค่าเทอม และสิ่งที่ต้องจ่ายทุกเดือน แผนกันไว้ก่อนเสมอ', en: 'Rent, food, school fees and what you must pay every month. The plan protects it first.' }],
      [{ th: 'บิลครั้งเดียว', en: 'One-off bill' }, { th: 'ค่าใช้จ่ายก้อนเดียวในเดือนนี้ เช่น ค่าเทอมหรือค่ารักษา', en: 'A single cost this month, such as tuition or medical care' }],
      [{ th: 'avalanche', en: 'Avalanche' }, { th: 'จ่ายเพิ่มให้หนี้ที่ดอกเบี้ยสูงสุดก่อน เพื่อลดดอกเบี้ยรวม', en: 'Putting extra money on the highest interest rate first, to cut total interest' }],
      [{ th: 'รีไฟแนนซ์', en: 'Refinance' }, { th: 'ย้ายหนี้ไปสัญญาใหม่ที่เงื่อนไขต่างจากเดิม', en: 'Moving a debt to a new contract with different terms' }],
      [{ th: 'ส่วนต่างสุทธิ', en: 'Net difference' }, { th: 'ต้นทุนรวมเดิมลบต้นทุนรวมใหม่ หลังคิดค่าธรรมเนียม ค่าปรับ และประกัน', en: 'Old total cost minus new total cost, after fees, penalty and insurance' }],
      [{ th: 'ปิดข้อมูล (mask)', en: 'Masking' }, { th: 'ลบเลขบัญชี เบอร์โทร เลขบัตร และชื่อออกจากข้อความก่อนส่งให้ AI', en: 'Removing account numbers, phone numbers, ID numbers and names from text before it goes to the AI' }],
      [{ th: 'ข้อมูลตัวอย่าง', en: 'Sample data' }, { th: 'ข้อมูลที่ไม่ใช่ของจริง มีป้ายกำกับเสมอ', en: 'Data that is not real. It is always labelled.' }],
    ]} /> },
  ]
  return <Doc title={{ th: 'คู่มือ', en: 'Guide' }} sub={{ th: 'ทุกส่วนของ Debtwise ทีละขั้น', en: 'Every part of Debtwise, step by step.' }} sections={sections} />
}

/* =========================================================== Terms */
export function Terms({ bare }: { bare?: boolean } = {}) {
  const sections: Sec[] = [
    { id: 'draft', title: { th: 'ร่างฉบับนี้', en: 'About this draft' }, body: <>
      <P b={{ th: 'ข้อกำหนดนี้เป็นร่างสำหรับต้นแบบ Debtwise 0.1.0 อัปเดตล่าสุด 15 ตุลาคม 2026 และอาจเปลี่ยนก่อนการเผยแพร่จริง ยังไม่ได้ผ่านการตรวจโดยนักกฎหมาย', en: 'These terms are a draft for the Debtwise 0.1.0 prototype. Last updated 15 October 2026. They may change before any public release and have not been reviewed by a lawyer.' }} />
      <P b={{ th: 'การใช้ Debtwise ถือว่าคุณยอมรับข้อกำหนดนี้ หากไม่ยอมรับ โปรดหยุดใช้', en: 'By using Debtwise you accept these terms. If you do not accept them, please stop using it.' }} />
    </> },
    { id: 'definitions', title: { th: 'คำที่ใช้', en: 'Words used' }, body: <Table head={[{ th: 'คำ', en: 'Term' }, { th: 'ความหมาย', en: 'Meaning' }]} rows={[
      [{ th: 'บริการ', en: 'The service' }, { th: 'เว็บแอป Debtwise และหน้าสาธารณะ', en: 'The Debtwise web app and its public pages' }],
      [{ th: 'คุณ', en: 'You' }, { th: 'ผู้ใช้ที่เข้าสู่ระบบหรือเปิดหน้าสาธารณะ', en: 'Anyone who signs in or opens a public page' }],
      [{ th: 'ข้อมูลของคุณ', en: 'Your data' }, { th: 'สิ่งที่คุณกรอก อัปโหลด หรือยืนยันในบริการ', en: 'What you enter, upload or confirm in the service' }],
      [{ th: 'ผู้ให้บริการภายนอก', en: 'Third-party services' }, { th: 'Supabase (บัญชีและฐานข้อมูล) ผู้ให้บริการ AI (Google Gemini และ Groq เป็นตัวสำรอง) บริการเสียง (ElevenLabs) CoinGecko (ราคาโทเคน) และผู้โฮสต์ (Vercel)', en: 'Supabase (accounts and database), the AI providers (Google Gemini, with Groq as a backup), the voice service (ElevenLabs), CoinGecko (token prices) and the host (Vercel)' }],
    ]} /> },
    { id: 'service', title: { th: 'บริการนี้คืออะไร', en: 'What the service is' }, body: <>
      <P b={{ th: 'Debtwise เป็นเครื่องมือให้ข้อมูลที่ช่วยให้คุณเห็นหนี้ ประมาณเงินที่เหลือในแต่ละเดือน ประมาณภาษี และเทียบตัวเลขรีไฟแนนซ์ ไม่ได้เป็นธนาคาร ผู้ให้กู้ นายหน้า หรือที่ปรึกษาที่ได้รับใบอนุญาต', en: 'Debtwise is an information tool that helps you see your debt, estimate what is left each month, estimate tax and compare refinance numbers. It is not a bank, a lender, a broker or a licensed adviser.' }} />
      <P b={{ th: 'ไม่มีการเก็บเงิน โอนเงิน หรือชำระหนี้แทนคุณ และไม่ติดต่อผู้ให้กู้แทนคุณ', en: 'It does not hold, move or pay money for you, and it does not contact your lenders for you.' }} />
      <P b={{ th: 'บริการยังเป็นต้นแบบ ฟีเจอร์ หน้าจอ และรูปแบบข้อมูลอาจเปลี่ยนหรือหยุดได้โดยไม่แจ้งล่วงหน้า', en: 'The service is a prototype. Features, screens and data formats may change or stop without notice.' }} />
    </> },
    { id: 'advice', title: { th: 'ไม่ใช่คำแนะนำ', en: 'Not advice' }, body: <>
      <P b={{ th: 'ตัวเลข แผน การประมาณภาษี ข้อมูลตลาด และข้อความของที่ปรึกษาเป็นการประมาณและให้ข้อมูล ไม่ใช่คำแนะนำทางการเงิน ภาษี กฎหมาย หรือการลงทุน ตรวจสอบกับผู้ให้กู้หรือผู้เชี่ยวชาญก่อนตัดสินใจ', en: 'Numbers, plans, tax estimates, market data and consultant replies are estimates and information, not financial, tax, legal or investment advice. Check with your lender or a professional before you decide.' }} />
      <Ul items={[
        { th: 'การประมาณภาษีใช้กฎที่กรมสรรพากรเผยแพร่สำหรับปีภาษี 2568 แต่ไม่ใช่การคำนวณเพื่อยื่นแบบ และไม่ได้พิจารณาสถานการณ์ทุกกรณี', en: 'The tax estimate uses the rules the Revenue Department published for tax year 2568, but it is not a filing calculation and does not cover every situation.' },
        { th: 'ข้อมูลโทเคนมาจาก CoinGecko และอาจล่าช้าหรือคลาดเคลื่อน คริปโตมีความเสี่ยงสูง และราคาอาจลดลงมาก', en: 'Token data comes from CoinGecko and may be late or wrong. Crypto is high risk and prices can fall sharply.' },
        { th: 'วันปลดล็อกโทเคนและข้อเสนอรีไฟแนนซ์เป็นข้อมูลตัวอย่างที่มีป้ายกำกับ ไม่ใช่ข้อเสนอจริง', en: 'Token unlock dates and refinance offers are labelled sample data, not real offers.' },
        { th: 'โครงการช่วยเหลือของธนาคารแห่งประเทศไทยที่กล่าวถึงเป็นข้อมูลสาธารณะโดยสรุป การได้รับสิทธิขึ้นกับเงื่อนไขและผู้ให้กู้', en: 'Bank of Thailand programmes mentioned are public information in short form. Whether you qualify depends on the terms and your lender.' },
      ]} />
    </> },
    { id: 'ai', title: { th: 'การใช้ AI', en: 'Use of AI' }, body: <>
      <P b={{ th: 'AI อาจอ่านเอกสารผิด อธิบายไม่ครบ หรือตอบไม่ตรงสถานการณ์ คุณต้องตรวจตัวเลขในหน้าตรวจก่อนบันทึก และเป็นผู้รับผิดชอบการตัดสินใจของคุณเอง', en: 'The AI can misread a document, explain something incompletely or miss your situation. You must check the numbers on the review screen before saving, and you are responsible for your own decisions.' }} />
      <P b={{ th: 'ตัวเลขทางการเงินคำนวณในโปรแกรม ไม่ใช่โดย AI และแอปเตือนเมื่อคำตอบมีตัวเลขที่ไม่อยู่ในข้อมูลของคุณ แต่การเตือนนี้ไม่รับประกันว่าจะจับได้ทุกกรณี', en: 'Money figures are computed in the app, not by the AI, and the app warns when a reply has a figure that is not in your data. That warning does not promise to catch every case.' }} />
    </> },
    { id: 'account', title: { th: 'บัญชีและความรับผิดชอบของคุณ', en: 'Your account and duties' }, body: <Ul items={[
      { th: 'ใช้ข้อมูลของคุณเองหรือข้อมูลที่คุณมีสิทธิ์ใช้ และกรอกข้อมูลให้ตรงความจริงเท่าที่ทำได้', en: 'Use your own data, or data you have the right to use, and enter it as accurately as you can.' },
      { th: 'ดูแลบัญชี Google หรืออีเมลที่ใช้เข้าสู่ระบบให้ปลอดภัย และออกจากระบบเมื่อใช้เครื่องที่ไม่ใช่ของคุณ', en: 'Keep the Google or email account you sign in with secure, and sign out on a device that is not yours.' },
      { th: 'ไม่พยายามเจาะระบบ รบกวนบริการ ใช้บริการเกินปกติอย่างอัตโนมัติ หรืออัปโหลดไฟล์ที่เป็นอันตราย', en: 'Do not try to break in, disrupt the service, use it in an automated way beyond normal use, or upload harmful files.' },
      { th: 'ไม่ใช้บริการเพื่อวัตถุประสงค์ที่ผิดกฎหมาย หรือเพื่อทำให้ผู้อื่นเข้าใจผิดเกี่ยวกับหนี้หรือภาษีของตน', en: 'Do not use the service for anything illegal, or to mislead anyone about debt or tax.' },
      { th: 'ไม่อัปโหลดเอกสารของผู้อื่นโดยไม่ได้รับอนุญาต', en: 'Do not upload other people’s documents without their permission.' },
    ]} /> },
    { id: 'content', title: { th: 'ข้อมูลของคุณและสิทธิ์', en: 'Your data and rights' }, body: <>
      <P b={{ th: 'ข้อมูลของคุณยังเป็นของคุณ คุณอนุญาตให้บริการเก็บและประมวลผลข้อมูลนั้นเพียงเท่าที่จำเป็นเพื่อให้บริการทำงาน ตามนโยบายความเป็นส่วนตัว', en: 'Your data stays yours. You allow the service to store and process it only as far as needed to run the service, as the privacy policy describes.' }} />
      <P b={{ th: 'คุณส่งออกหรือลบข้อมูลของคุณได้ทุกเมื่อจากหน้าโปรไฟล์', en: 'You can export or delete your data at any time from Profile.' }} />
      <P b={{ th: 'ชื่อ Debtwise โลโก้ ดีไซน์ และโค้ดของบริการเป็นของผู้พัฒนา หรือใช้ภายใต้สิทธิ์ของเจ้าของ เช่น ฟอนต์และไอคอนที่ใช้ตามสัญญาอนุญาตของแต่ละรายการ', en: 'The Debtwise name, logo, design and code belong to the developer, or are used under their owners’ licences, such as the fonts and icons under each one’s licence.' }} />
    </> },
    { id: 'third', title: { th: 'บริการของบุคคลที่สาม', en: 'Third-party services' }, body: <>
      <P b={{ th: 'บริการนี้พึ่งพาผู้ให้บริการภายนอกตามที่ระบุ ผู้ให้บริการเหล่านี้มีข้อกำหนดและนโยบายของตน และอาจหยุดหรือเปลี่ยนบริการได้ ซึ่งอาจทำให้บางฟีเจอร์ใช้ไม่ได้ชั่วคราว เช่น แชตหรือข้อมูลตลาด', en: 'The service relies on the third-party services listed above. They have their own terms and policies and may stop or change, which can make some features unavailable for a while, such as the chat or market data.' }} />
    </> },
    { id: 'asis', title: { th: 'ให้บริการตามสภาพและขีดจำกัดความรับผิด', en: 'As is, and limits of liability' }, body: <>
      <P b={{ th: 'ต้นแบบนี้ให้บริการตามสภาพและตามที่มี ไม่มีการรับประกันความถูกต้อง ความต่อเนื่อง ความปลอดภัยสมบูรณ์ หรือความเหมาะสมกับวัตถุประสงค์ใดๆ', en: 'This prototype is provided as is and as available, with no promise of accuracy, availability, complete security or fitness for any purpose.' }} />
      <P b={{ th: 'ในขอบเขตที่กฎหมายอนุญาต ผู้พัฒนาไม่รับผิดชอบความเสียหายทางตรงหรือทางอ้อมจากการใช้หรือไม่สามารถใช้บริการ รวมถึงการตัดสินใจทางการเงินที่อาศัยตัวเลขในแอป', en: 'To the extent the law allows, the developer is not liable for direct or indirect loss from using or not being able to use the service, including financial decisions made on numbers in the app.' }} />
      <P b={{ th: 'ข้อกำหนดนี้ไม่ตัดสิทธิ์ที่กฎหมายคุ้มครองผู้บริโภคให้คุณ', en: 'These terms do not remove rights that consumer law gives you.' }} />
    </> },
    { id: 'end', title: { th: 'การยุติและการเปลี่ยนแปลง', en: 'Ending and changes' }, body: <>
      <P b={{ th: 'คุณหยุดใช้และลบข้อมูลได้ทุกเมื่อจากหน้าโปรไฟล์ เราอาจระงับบัญชีที่ใช้ผิดข้อกำหนด และอาจเปลี่ยนหรือหยุดต้นแบบนี้ได้', en: 'You can stop and delete your data any time from Profile. We may suspend an account that breaks these terms, and may change or stop this prototype.' }} />
      <P b={{ th: 'หากแก้ข้อกำหนดเมื่อมีการเผยแพร่จริง จะแจ้งในบริการและวันที่อัปเดตจะเปลี่ยน การใช้ต่อหลังแก้ไขถือว่ายอมรับฉบับใหม่', en: 'If the terms are revised for a real release, the service will say so and the update date will change. Continuing to use it after a revision means you accept the new version.' }} />
    </> },
    { id: 'law', title: { th: 'กฎหมายที่ใช้และการติดต่อ', en: 'Governing law and contact' }, body: <>
      <P b={{ th: 'ร่างนี้มีแนวคิดให้ใช้กฎหมายไทย ข้อนี้ต้องให้นักกฎหมายยืนยันก่อนเผยแพร่จริง', en: 'This draft intends Thai law to apply. A lawyer must confirm this before any real release.' }} />
      <P b={{ th: 'ช่องทางติดต่อผู้พัฒนาจะระบุก่อนเผยแพร่จริง ระหว่างนี้ใช้หน้าชุมชนและช่วยเหลือในเว็บไซต์', en: 'Contact details for the developer will be added before a real release. Until then, use the Community and Support pages.' }} />
    </> },
  ]
  return <Doc title={{ th: 'ข้อกำหนด', en: 'Terms' }} sub={{ th: 'ร่างข้อกำหนดการใช้งานสำหรับต้นแบบ', en: 'Draft terms of use for the prototype.' }} sections={sections} bare={bare} />
}

/* =========================================================== Privacy */
export function Privacy({ bare }: { bare?: boolean } = {}) {
  const L = useL()
  const sections: Sec[] = [
    { id: 'draft', title: { th: 'ร่างฉบับนี้', en: 'About this draft' }, body: <>
      <P b={{ th: 'นี่เป็นร่างนโยบายความเป็นส่วนตัวสำหรับต้นแบบ Debtwise 0.1.0 อัปเดตล่าสุด 15 ตุลาคม 2026 อธิบายสิ่งที่แอปทำจริงในวันนี้ และต้องให้นักกฎหมายตรวจก่อนเผยแพร่จริง', en: 'This is a draft privacy policy for the Debtwise 0.1.0 prototype, last updated 15 October 2026. It describes what the app really does today and needs a lawyer’s review before any real release.' }} />
      <P b={{ th: 'ผู้พัฒนา Debtwise เป็นผู้ควบคุมข้อมูลส่วนบุคคลสำหรับบริการนี้ ช่องทางติดต่อจะระบุก่อนเผยแพร่จริง', en: 'The developer of Debtwise is the data controller for this service. Contact details will be added before a real release.' }} />
    </> },
    { id: 'collect', title: { th: 'ข้อมูลที่เก็บ', en: 'What we keep' }, body: <>
      <P b={{ th: 'เราเก็บเฉพาะข้อมูลที่คุณป้อนหรือยืนยัน และข้อมูลบัญชีที่ใช้เข้าสู่ระบบ', en: 'We keep only what you enter or confirm, plus the account details you sign in with.' }} />
      <Table head={[{ th: 'ข้อมูล', en: 'Data' }, { th: 'รายละเอียด', en: 'What it holds' }]} rows={[
        [{ th: 'บัญชี', en: 'Account' }, { th: 'อีเมล และถ้าเข้าด้วย Google จะได้ชื่อและรูปโปรไฟล์ของบัญชี Google', en: 'Email and, if you use Google, the name and profile picture of your Google account' }],
        [{ th: 'โปรไฟล์', en: 'Profile' }, { th: 'ชื่อ ปีเกิด จำนวนผู้พึ่งพา ประเภทรายได้ รายได้ รายได้อื่น วันที่เงินเข้า อายุเลิกทำงาน รายได้หลังเลิกทำงาน ค่าใช้จ่ายจำเป็น ภาษา', en: 'Name, birth year, dependants, income type, income, other income, pay day, retirement age, income after, essentials, language' }],
        [{ th: 'หนี้', en: 'Debts' }, { th: 'ผู้ให้กู้ ประเภท ชื่อเรียก ยอดคงเหลือ ดอกเบี้ย ยอดขั้นต่ำ วันครบกำหนด เดือนที่เหลือ สถานะ', en: 'Lender, type, label, balance, interest, minimum, due day, months left, status' }],
        [{ th: 'แหล่งที่มา', en: 'Sources' }, { th: 'ชื่อไฟล์ หน้า บรรทัดข้อความที่ใช้ยืนยันตัวเลข และความมั่นใจ ไม่เก็บตัวไฟล์', en: 'File name, page, the source line used to confirm a number, and confidence. The file itself is not stored.' }],
        [{ th: 'ข้อความ', en: 'Messages' }, { th: 'บทสนทนากับที่ปรึกษาตามที่คุณพิมพ์ และสำเนาที่ปิดข้อมูลแล้วที่ส่งให้ AI', en: 'Your conversation with the consultant as you typed it, and the masked copy that was sent to the AI' }],
        [{ th: 'แผน', en: 'Plans' }, { th: 'ภาพรวมแผนรายเดือนที่บันทึก', en: 'Saved monthly plan snapshots' }],
        [{ th: 'ในเบราว์เซอร์', en: 'In your browser' }, { th: 'เซสชันเข้าสู่ระบบ ภาษาที่เลือก บิลครั้งเดียวของเดือนนี้ และตัวบอกว่าแสดงข้อความต้อนรับเดือนใหม่แล้ว', en: 'Your sign in session, your chosen language, this month’s one-off bills, and a flag that the new-month message was shown' }],
      ]} />
      <P b={{ th: 'เราไม่เก็บตำแหน่งที่ตั้งหรือรายชื่อติดต่อ ไม่ขอรหัสเข้าธนาคาร เลขบัญชี หรือเลขบัตรประชาชน และไม่มีการวิเคราะห์การใช้งานหรือการติดตามเพื่อโฆษณา ถ้าคุณพิมพ์เลขเหล่านี้ในแชต ระบบปิดก่อนส่งให้ AI แต่ข้อความของคุณเองถูกบันทึกตามที่พิมพ์', en: 'We do not collect your location or contacts, do not ask for bank logins, account numbers or ID numbers, and use no usage analytics or advertising tracking. If you type such numbers in chat, they are masked before going to the AI, but your own message is saved as you typed it.' }} />
    </> },
    { id: 'use', title: { th: 'ใช้ข้อมูลเพื่ออะไร', en: 'What we use it for' }, body: <>
      <Ul items={[
        { th: 'ให้บริการหลัก: แสดงหนี้ คำนวณแผน ประมาณภาษี และเทียบรีไฟแนนซ์', en: 'To run the service: show your debts, build the plan, estimate tax and compare refinance.' },
        { th: 'ตอบในแชต: ส่งข้อความที่ปิดข้อมูลแล้วและตัวเลขสรุปให้ AI เพื่อให้ตอบตรงสถานการณ์ของคุณ', en: 'To answer in chat: send masked text and a summary of your numbers to the AI so it can answer for your situation.' },
        { th: 'อ่านเอกสาร: ส่งไฟล์ที่คุณอัปโหลดให้ AI เพื่ออ่านค่า', en: 'To read documents: send the file you upload to the AI to read its values.' },
        { th: 'รักษาความปลอดภัยและแก้ปัญหา: ป้องกันการใช้ผิดและตรวจข้อผิดพลาด', en: 'To keep the service secure and fix problems.' },
      ]} />
      <P b={{ th: 'ฐานในการประมวลผลคือความยินยอมของคุณเมื่อคุณป้อนหรืออัปโหลดข้อมูล และความจำเป็นในการให้บริการที่คุณขอ คุณถอนความยินยอมได้โดยลบข้อมูลหรือหยุดใช้', en: 'The basis is your consent when you enter or upload data, and what is needed to give you the service you asked for. You can withdraw consent by deleting your data or by stopping use.' }} />
    </> },
    { id: 'where', title: { th: 'เก็บที่ไหนและปลอดภัยแค่ไหน', en: 'Where it is stored and how it is protected' }, body: <>
      <Ul items={[
        { th: 'ข้อมูลเก็บในฐานข้อมูล Supabase ของโปรเจกต์ Debtwise ทุกตารางเปิด Row Level Security ผู้ใช้อ่านและเขียนได้เฉพาะแถวของตัวเอง', en: 'Data is stored in the Debtwise Supabase database. Every table uses Row Level Security, so a user can read and write only their own rows.' },
        { th: 'เบราว์เซอร์ถือเฉพาะกุญแจสาธารณะของ Supabase ซึ่งปลอดภัยเพราะ Row Level Security กุญแจของบริการ AI อยู่ฝั่งเซิร์ฟเวอร์เท่านั้น', en: 'The browser holds only Supabase’s public key, which is safe because of Row Level Security. The AI service keys live on the server only.' },
        { th: 'การเชื่อมต่อใช้ HTTPS ฟังก์ชันฝั่งเซิร์ฟเวอร์ตรวจว่าคุณเข้าสู่ระบบก่อนรับคำขอ AI และเสียง และไม่เก็บหรือบันทึกเนื้อหาคำขอ', en: 'Connections use HTTPS. The server functions check that you are signed in before accepting an AI or voice request, and do not store or log the content.' },
        { th: 'เซิร์ฟเวอร์ของผู้ให้บริการอาจอยู่นอกประเทศไทย ข้อมูลจึงอาจถูกประมวลผลข้ามประเทศ', en: 'The providers’ servers may be outside Thailand, so data may be processed across borders.' },
        { th: 'ผู้โฮสต์เก็บบันทึกการทำงานทั่วไปตามปกติของแพลตฟอร์ม', en: 'The host keeps the standard operational logs of its platform.' },
      ]} />
      <Note icon="info-circle">{L({ th: 'ก่อนเผยแพร่จริง จะตรวจและระบุที่นี่ว่าฐานข้อมูลอยู่ภูมิภาคไหน และเงื่อนไขของผู้ให้บริการแต่ละราย', en: 'Before a real release, the database region and each provider’s terms will be checked and stated here.' })}</Note>
    </> },
    { id: 'ai', title: { th: 'AI และเสียง', en: 'AI and voice' }, body: <>
      <Ul items={[
        { th: 'ข้อความที่คุณพิมพ์หรือพูดถูกปิดชื่อ เลขบัญชี เบอร์โทร และเลขบัตรประชาชนก่อนส่งให้ AI ระบบปิดชื่อตามชื่อที่คุณใส่ในโปรไฟล์ และปิดตัวเลขตามรูปแบบที่พบบ่อย อาจไม่จับได้ทุกรูปแบบ', en: 'Text you type or speak has names, account numbers, phone numbers and national ID numbers removed before it goes to the AI. Names are matched to the name in your profile and numbers by common patterns, so not every format is caught.' },
        { th: 'AI ได้รับตัวเลขสรุป (รายได้ ค่าจำเป็น ผู้ให้กู้ ประเภทหนี้ ยอดคงเหลือ ดอกเบี้ย ยอดขั้นต่ำ ยอดที่วางแผนจ่าย บิลครั้งเดียว) และข้อความล่าสุดสิบข้อความ', en: 'The AI receives a summary of numbers (income, essentials, lenders, debt types, balances, rates, minimums, planned payments, one-off bills) and the last ten messages.' },
        { th: 'ไฟล์รูปและ PDF ที่อัปโหลดส่งให้ AI ตามที่เป็น ปิดข้อมูลก่อนส่งไม่ได้ และไม่ถูกเก็บ', en: 'Pictures and PDFs you upload go to the AI as they are, cannot be masked first, and are not stored.' },
        { th: 'หาก Google Gemini ไม่ว่างหรือใช้ไม่ได้ ข้อความแชต (ไม่รวมไฟล์) อาจถูกส่งให้ Groq แทน ซึ่งได้รับข้อมูลชุดเดียวกัน คือข้อความที่ปิดข้อมูลแล้วและตัวเลขสรุป', en: 'If Google Gemini is busy or down, chat text (never files) may go to Groq instead, which receives the same data: masked text and the summary of numbers.' },
        { th: 'เมื่อใช้ไมค์หรือฟังเสียงตอบ เสียงหรือข้อความไปยังบริการเสียง (ElevenLabs) และฟังก์ชันของเราไม่เก็บเนื้อหา', en: 'When you use the mic or hear replies, audio or text goes to the voice service (ElevenLabs), and our functions do not store the content.' },
        { th: 'เราไม่ใช้ข้อมูลของคุณฝึกโมเดลของเราเอง การจัดการข้อมูลฝั่งผู้ให้บริการ AI และเสียงเป็นไปตามนโยบายและแผนบริการของผู้ให้บริการนั้น', en: 'We do not train any model of our own on your data. How the AI and voice providers handle data follows their own policies and plans.' },
      ]} />
      <Note icon="info-circle">{L({ th: 'ข้อความที่ปิดข้อมูลแล้วที่ส่งให้ AI เก็บไว้กับคำตอบในประวัติสนทนาของคุณ เพื่อให้ตรวจย้อนหลังได้', en: 'The masked text that was sent to the AI is kept with the reply in your conversation history so it can be reviewed.' })}</Note>
    </> },
    { id: 'share', title: { th: 'การแบ่งปัน', en: 'Sharing' }, body: <>
      <P b={{ th: 'เราไม่ขายข้อมูลของคุณและไม่แสดงโฆษณา ข้อมูลถูกประมวลผลโดยผู้ให้บริการที่จำเป็นต่อการทำงานเท่านั้น', en: 'We do not sell your data and show no ads. It is processed only by the providers the app needs to work.' }} />
      <Table head={[{ th: 'ผู้ให้บริการ', en: 'Provider' }, { th: 'ทำอะไร', en: 'What it does' }, { th: 'เห็นข้อมูลอะไร', en: 'What it sees' }]} rows={[
        [{ th: 'Supabase', en: 'Supabase' }, { th: 'บัญชีและฐานข้อมูล', en: 'Accounts and database' }, { th: 'ข้อมูลทั้งหมดที่คุณบันทึกในบัญชี', en: 'Everything you save in your account' }],
        [{ th: 'Google (Gemini)', en: 'Google (Gemini)' }, { th: 'อ่านเอกสารและตอบแชต', en: 'Reads documents and answers chat' }, { th: 'ข้อความที่ปิดข้อมูลแล้ว ตัวเลขสรุป และไฟล์ที่คุณอัปโหลด', en: 'Masked text, a summary of numbers and files you upload' }],
        [{ th: 'Groq (สำรอง)', en: 'Groq (backup)' }, { th: 'ตอบแชตแทนเมื่อ Gemini ใช้ไม่ได้', en: 'Answers chat when Gemini is down' }, { th: 'ข้อความที่ปิดข้อมูลแล้วและตัวเลขสรุป ไม่รับไฟล์', en: 'Masked text and a summary of numbers. Never files.' }],
        [{ th: 'ElevenLabs', en: 'ElevenLabs' }, { th: 'เสียงเป็นข้อความและข้อความเป็นเสียง', en: 'Speech to text and text to speech' }, { th: 'เสียงที่คุณพูดหรือข้อความคำตอบ เมื่อคุณใช้ฟีเจอร์เสียง', en: 'Audio you speak or reply text, when you use voice' }],
        [{ th: 'Google (เข้าสู่ระบบ)', en: 'Google (sign in)' }, { th: 'ยืนยันตัวตน', en: 'Identity' }, { th: 'อีเมล ชื่อ และรูปโปรไฟล์ที่คุณอนุญาต', en: 'The email, name and picture you allow' }],
        [{ th: 'CoinGecko', en: 'CoinGecko' }, { th: 'ราคาและปริมาณโทเคน', en: 'Token prices and supply' }, { th: 'ไม่เห็นข้อมูลของคุณ เซิร์ฟเวอร์ของเราดึงข้อมูลสาธารณะ', en: 'Nothing about you. Our server fetches public data.' }],
        [{ th: 'Vercel', en: 'Vercel' }, { th: 'โฮสต์เว็บและฟังก์ชัน', en: 'Hosts the site and functions' }, { th: 'คำขอที่ผ่านระบบตามปกติของแพลตฟอร์ม', en: 'Requests that pass through, as any host does' }],
      ]} />
      <P b={{ th: 'เราอาจเปิดเผยข้อมูลหากกฎหมายหรือคำสั่งของหน่วยงานที่มีอำนาจกำหนด', en: 'We may disclose data if the law or an order from a competent authority requires it.' }} />
    </> },
    { id: 'keep', title: { th: 'เก็บนานแค่ไหน', en: 'How long we keep it' }, body: <>
      <Ul items={[
        { th: 'ข้อมูลในบัญชีเก็บจนกว่าคุณจะลบ ไม่มีการลบอัตโนมัติ', en: 'Account data is kept until you delete it. Nothing is deleted automatically.' },
        { th: 'ไฟล์ที่อัปโหลดไม่ถูกเก็บ เก็บเฉพาะค่าที่คุณยืนยันและบรรทัดต้นฉบับ', en: 'Uploaded files are not stored. Only the values you confirm and the source line are kept.' },
        { th: 'ข้อมูลในเบราว์เซอร์เก็บจนกว่าคุณจะล้างข้อมูลเบราว์เซอร์ ล้างบิลครั้งเดียว หรือออกจากระบบแล้วลบข้อมูลเว็บไซต์', en: 'Browser data stays until you clear your browser data, clear the one-off bills, or sign out and clear the site data.' },
        { th: 'สำเนาที่อยู่ในระบบสำรองของผู้ให้บริการอาจอยู่ต่ออีกช่วงหนึ่งตามรอบสำรองของผู้ให้บริการ', en: 'Copies in the providers’ backups may remain for a while, following their backup cycle.' },
      ]} />
    </> },
    { id: 'control', title: { th: 'สิทธิ์และการควบคุมของคุณ', en: 'Your rights and controls' }, body: <>
      <Table head={[{ th: 'สิทธิ์', en: 'Right' }, { th: 'ทำได้อย่างไร', en: 'How' }]} rows={[
        [{ th: 'เข้าถึงและรับสำเนา', en: 'Access and a copy' }, { th: 'หน้าโปรไฟล์ ส่งออกสำเนา (ไฟล์ JSON)', en: 'Profile, Export a copy (a JSON file)' }],
        [{ th: 'แก้ไขให้ถูกต้อง', en: 'Correct it' }, { th: 'แก้โปรไฟล์และหนี้ได้ทุกเมื่อ', en: 'Edit your profile and debts any time' }],
        [{ th: 'ลบ', en: 'Delete' }, { th: 'หน้าโปรไฟล์ ลบข้อมูลทั้งหมดของฉัน (ลบโปรไฟล์ หนี้ แหล่งที่มา แผน ข้อความ และล้างบิลครั้งเดียวในเบราว์เซอร์)', en: 'Profile, Delete all my data (removes profile, debts, sources, plans, messages and clears one-off bills in the browser)' }],
        [{ th: 'ถอนความยินยอม', en: 'Withdraw consent' }, { th: 'ลบข้อมูลหรือหยุดใช้ได้ทุกเมื่อ', en: 'Delete your data or stop using the service any time' }],
        [{ th: 'ย้ายข้อมูล', en: 'Take it with you' }, { th: 'ไฟล์ส่งออกเป็นรูปแบบ JSON ที่อ่านได้', en: 'The export is a readable JSON file' }],
        [{ th: 'คัดค้านหรือร้องเรียน', en: 'Object or complain' }, { th: 'ติดต่อผู้พัฒนา และคุณมีสิทธิ์ร้องเรียนต่อหน่วยงานคุ้มครองข้อมูลส่วนบุคคลของประเทศไทย', en: 'Contact the developer. You also have the right to complain to Thailand’s personal data protection authority.' }],
      ]} />
      <Note icon="exclamation-triangle">{L({ th: 'การลบข้อมูลทั้งหมดไม่ลบบัญชีเข้าสู่ระบบเอง (อีเมลหรือบัญชี Google ที่ผูกอยู่) การลบบัญชีเข้าสู่ระบบต้องให้ผู้พัฒนาดำเนินการ และยังไม่มีปุ่มสำหรับเรื่องนี้ในแอป', en: 'Deleting all your data does not delete the sign in account itself (the email or Google login linked to it). Removing the sign in account has to be done by the developer, and there is no button for it in the app yet.' })}</Note>
    </> },
    { id: 'storage', title: { th: 'ในเบราว์เซอร์ของคุณ', en: 'In your browser' }, body: <>
      <P b={{ th: 'เราใช้ที่เก็บของเบราว์เซอร์ (local storage) ไม่ใช้คุกกี้โฆษณาหรือการติดตาม', en: 'We use browser storage (local storage). We use no advertising or tracking cookies.' }} />
      <Table head={[{ th: 'รายการ', en: 'Item' }, { th: 'ใช้ทำอะไร', en: 'What for' }]} rows={[
        [{ th: 'โทเคนเซสชันของ Supabase', en: 'Supabase session token' }, { th: 'ให้คุณอยู่ในระบบ', en: 'Keeps you signed in' }],
        [{ th: 'dw-lang', en: 'dw-lang' }, { th: 'จำภาษาที่เลือก', en: 'Remembers your language' }],
        [{ th: 'dw-oneoff', en: 'dw-oneoff' }, { th: 'บิลครั้งเดียวของเดือนนี้ต่อบัญชี', en: 'This month’s one-off bills, per account' }],
        [{ th: 'dw-monthly-notice', en: 'dw-monthly-notice' }, { th: 'แสดงข้อความต้อนรับเดือนใหม่ครั้งเดียว', en: 'Shows the new-month message once' }],
      ]} />
      <P b={{ th: 'ล้างข้อมูลเว็บไซต์ในเบราว์เซอร์เพื่อลบรายการเหล่านี้ และแอปอาจเก็บไฟล์ของแอปไว้ในแคชเพื่อให้เปิดเร็ว', en: 'Clear the site data in your browser to remove these. The app may also keep its own files in the cache so it opens faster.' }} />
    </> },
    { id: 'children', title: { th: 'เด็ก', en: 'Children' }, body: <>
      <P b={{ th: 'บริการนี้ไม่ได้ทำสำหรับผู้ที่อายุต่ำกว่า 18 ปี เราไม่ตั้งใจเก็บข้อมูลของผู้เยาว์ หากพบว่ามีการเก็บ ผู้ปกครองขอให้ลบได้', en: 'The service is not made for anyone under 18. We do not mean to collect data from minors. If we find we have, a parent can ask for it to be deleted.' }} />
    </> },
    { id: 'changes', title: { th: 'การเปลี่ยนแปลงและการติดต่อ', en: 'Changes and contact' }, body: <>
      <P b={{ th: 'หากเปลี่ยนนโยบายนี้ วันที่อัปเดตด้านบนจะเปลี่ยน และจะแจ้งในบริการเมื่อเป็นการเปลี่ยนที่สำคัญ', en: 'If this policy changes, the update date above will change, and the service will say so for important changes.' }} />
      <P b={{ th: 'ช่องทางติดต่อผู้พัฒนาจะระบุก่อนเผยแพร่จริง ระหว่างนี้ใช้หน้าชุมชนและช่วยเหลือ', en: 'Contact details for the developer will be added before a real release. Until then, use the Community and Support pages.' }} />
    </> },
  ]
  return <Doc title={{ th: 'ความเป็นส่วนตัว', en: 'Privacy' }} sub={{ th: 'ร่างนโยบายความเป็นส่วนตัวสำหรับต้นแบบ', en: 'Draft privacy policy for the prototype.' }} sections={sections} bare={bare} />
}
