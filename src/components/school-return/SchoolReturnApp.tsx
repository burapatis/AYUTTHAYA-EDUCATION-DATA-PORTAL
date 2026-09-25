import { useEffect, useMemo, useState } from 'react';
import {
  createSchoolReturn,
  formatCount,
  formatPercent,
  formatRatio,
  gradesForLevel,
  normalizeSchoolReturn,
  parseCount,
  schoolReturnJurisdictions,
  schoolReturnKinds,
  schoolReturnLevels,
  summarizeSchoolReturn,
  type SchoolGradeId,
  type SchoolKindId,
  type SchoolJurisdictionId,
  type SchoolLevelId,
  type SchoolReturn,
} from '../../lib/school-return';

const storageKey = 'ayutthaya-school-return-v1';

interface Props {
  districts: string[];
}

function loadRecords(): SchoolReturn[] {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Array<Partial<SchoolReturn>>;
    return Array.isArray(parsed) ? parsed.map((item) => normalizeSchoolReturn(item)) : [];
  } catch {
    return [];
  }
}

function countField(value: number | null): string {
  return value === null ? '' : String(value);
}

export default function SchoolReturnApp({ districts }: Props) {
  const [records, setRecords] = useState<SchoolReturn[]>([]);
  const [draft, setDraft] = useState<SchoolReturn>(() => createSchoolReturn());
  const [notice, setNotice] = useState('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const saved = loadRecords();
    setRecords(saved);
    if (saved[0]) setDraft(saved[0]);
    setReady(true);
  }, []);

  const summary = useMemo(() => summarizeSchoolReturn(draft), [draft]);
  const jurisdictionLabel = schoolReturnJurisdictions.find((item) => item.id === draft.jurisdiction)?.label ?? '';
  const kindLabel = schoolReturnKinds.find((item) => item.id === draft.kind)?.label ?? '';

  function update(partial: Partial<SchoolReturn>) {
    setDraft((current) => ({ ...current, ...partial }));
    setNotice('');
  }

  function updateLevel(levelId: SchoolLevelId, key: keyof SchoolReturn['levels'][SchoolLevelId], value: string) {
    setDraft((current) => ({
      ...current,
      levels: { ...current.levels, [levelId]: { ...current.levels[levelId], [key]: parseCount(value) } },
    }));
    setNotice('');
  }

  function updateGrade(gradeId: SchoolGradeId, key: keyof SchoolReturn['grades'][SchoolGradeId], value: string) {
    setDraft((current) => ({
      ...current,
      grades: { ...current.grades, [gradeId]: { ...current.grades[gradeId], [key]: parseCount(value) } },
    }));
    setNotice('');
  }

  function save() {
    const name = draft.schoolName.trim();
    if (!name || !draft.district) {
      setNotice('กรอกชื่อสถานศึกษาและอำเภอก่อนบันทึก');
      return;
    }
    const next = { ...draft, schoolName: name, id: draft.id || crypto.randomUUID(), updatedAt: new Date().toISOString() };
    const others = records.filter((item) => item.id !== next.id);
    const saved = [next, ...others];
    localStorage.setItem(storageKey, JSON.stringify(saved));
    setRecords(saved);
    setDraft(next);
    setNotice('บันทึกบนเครื่องนี้แล้ว ข้อมูลยังไม่ถูกส่งเข้าชุดสถิติจังหวัด');
  }

  function remove(id: string) {
    const saved = records.filter((item) => item.id !== id);
    localStorage.setItem(storageKey, JSON.stringify(saved));
    setRecords(saved);
    if (draft.id === id) setDraft(createSchoolReturn());
  }

  async function copySummary() {
    const lines = [
      draft.schoolName || 'สถานศึกษา',
      `${draft.district || '—'} · ${jurisdictionLabel} · ${kindLabel}`,
      `ปีการศึกษา ${draft.academicYearBE}`,
      `นักเรียน ${formatCount(summary.students)} คน`,
      `ครูหรืออาจารย์ ${formatCount(summary.teachers)} คน`,
      `นักเรียนต่อครู ${formatRatio(summary.studentsPerTeacher)} คน (ค่าคำนวณ)`,
      summary.studentsPerClassroom !== null ? `นักเรียนต่อห้อง ${formatRatio(summary.studentsPerClassroom)} คน (ค่าคำนวณ)` : '',
      summary.completionRate !== null ? `อัตราจบหรือผ่านกิจกรรม ${formatPercent(summary.completionRate).replace('+', '')} (ค่าคำนวณ)` : '',
      'ข้อมูลนี้เป็นรายงานที่สถานศึกษากรอกเอง ไม่ใช่ตัวเลขจากรายงานสถิติจังหวัด',
    ].filter(Boolean);
    await navigator.clipboard.writeText(lines.join('\n'));
    setNotice('คัดลอกสรุปแล้ว นำไปวางในหนังสือหรือข้อความถึงต้นสังกัดได้');
  }

  return (
    <div className="school-return">
      <aside className="school-return__list" aria-label="สถานศึกษาที่บันทึกบนเครื่องนี้">
        <button type="button" onClick={() => { setDraft(createSchoolReturn()); setNotice(''); }}>＋ บันทึกสถานศึกษาใหม่</button>
        {ready && records.length === 0 && <p>ยังไม่มีรายการบนเครื่องนี้</p>}
        <ul>
          {records.map((item) => (
            <li key={item.id}>
              <button type="button" className={item.id === draft.id ? 'is-current' : ''} onClick={() => setDraft(item)}>
                <strong>{item.schoolName}</strong>
                <span>{item.district} · ปี {item.academicYearBE}</span>
              </button>
              <button type="button" aria-label={`ลบ ${item.schoolName}`} onClick={() => remove(item.id)}>ลบ</button>
            </li>
          ))}
        </ul>
      </aside>
      <div className="school-return__work">
        <form className="school-return__form" onSubmit={(event) => { event.preventDefault(); save(); }}>
          <fieldset>
            <legend>ข้อมูลสถานศึกษา</legend>
            <label>ชื่อสถานศึกษา<input value={draft.schoolName} onChange={(event) => update({ schoolName: event.target.value })} required /></label>
            <label>อำเภอ
              <select value={draft.district} onChange={(event) => update({ district: event.target.value })} required>
                <option value="">เลือกอำเภอ</option>
                {districts.map((name) => <option key={name} value={name}>{name}</option>)}
              </select>
            </label>
            <label>สังกัด
              <select value={draft.jurisdiction} onChange={(event) => update({ jurisdiction: event.target.value as SchoolJurisdictionId })}>
                {schoolReturnJurisdictions.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
            </label>
            <label>ประเภทการจัดการศึกษา
              <select value={draft.kind} onChange={(event) => update({ kind: event.target.value as SchoolKindId })}>
                {schoolReturnKinds.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
            </label>
            <label>ปีการศึกษาที่รายงาน<input inputMode="numeric" value={draft.academicYearBE} onChange={(event) => update({ academicYearBE: parseCount(event.target.value) ?? draft.academicYearBE })} /></label>
          </fieldset>

          {draft.kind === 'basic' && (
            <fieldset>
              <legend>ขั้นพื้นฐาน แยกตามชั้นเรียน</legend>
              <p>กรอกห้องเรียนและนักเรียนทีละชั้น เว็บไซต์รวมเป็นก่อนประถม ประถม มัธยมต้น และมัธยมปลายให้เอง ชั้นที่ไม่ได้เปิดสอนเว้นว่างได้ ว่างหมายถึงยังไม่รายงาน ไม่ใช่ศูนย์ ครูกรอกครั้งเดียวที่แต่ละระดับ เพื่อไม่ให้นับคนซ้ำ</p>
              <div className="school-return__table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>ชั้น</th><th>ห้องเรียน</th><th>นักเรียนชาย</th><th>นักเรียนหญิง</th>
                    </tr>
                  </thead>
                  {schoolReturnLevels.map((level) => (
                    <tbody key={level.id}>
                      <tr className="school-return__group"><th colSpan={4} scope="colgroup">{level.label}</th></tr>
                      {gradesForLevel(level.id).map((grade) => {
                        const counts = draft.grades[grade.id];
                        return (
                          <tr key={grade.id}>
                            <th scope="row">{grade.label}</th>
                            {(['classrooms', 'studentsMale', 'studentsFemale'] as const).map((key) => (
                              <td key={key}><input aria-label={`${grade.label} ${key}`} inputMode="numeric" value={countField(counts[key])} onChange={(event) => updateGrade(grade.id, key, event.target.value)} /></td>
                            ))}
                          </tr>
                        );
                      })}
                    </tbody>
                  ))}
                </table>
              </div>
              <div className="school-return__table-wrap">
                <table>
                  <caption>ครู กรอกครั้งเดียวต่อระดับ</caption>
                  <thead><tr><th>ระดับ</th><th>ครูชาย</th><th>ครูหญิง</th></tr></thead>
                  <tbody>
                    {schoolReturnLevels.map((level) => (
                      <tr key={level.id}>
                        <th scope="row">{level.label}</th>
                        <td><input aria-label={`${level.label} ครูชาย`} inputMode="numeric" value={countField(draft.levels[level.id].teachersMale)} onChange={(event) => updateLevel(level.id, 'teachersMale', event.target.value)} /></td>
                        <td><input aria-label={`${level.label} ครูหญิง`} inputMode="numeric" value={countField(draft.levels[level.id].teachersFemale)} onChange={(event) => updateLevel(level.id, 'teachersFemale', event.target.value)} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="school-return__pair">
                <label>นักเรียนปีก่อนหน้า<input inputMode="numeric" value={countField(draft.previousStudents)} onChange={(event) => update({ previousStudents: parseCount(event.target.value) })} /></label>
                <label>ครูปีก่อนหน้า<input inputMode="numeric" value={countField(draft.previousTeachers)} onChange={(event) => update({ previousTeachers: parseCount(event.target.value) })} /></label>
                <label>นักเรียนออกกลางคันในปีนี้<input inputMode="numeric" value={countField(draft.dropoutStudents)} onChange={(event) => update({ dropoutStudents: parseCount(event.target.value) })} /></label>
              </div>
            </fieldset>
          )}

          {draft.kind === 'postsecondary' && (
            <fieldset>
              <legend>อาชีวศึกษาหรืออุดมศึกษา</legend>
              <div className="school-return__pair">
                <label>อาจารย์ชาย<input inputMode="numeric" value={countField(draft.lecturersMale)} onChange={(event) => update({ lecturersMale: parseCount(event.target.value) })} /></label>
                <label>อาจารย์หญิง<input inputMode="numeric" value={countField(draft.lecturersFemale)} onChange={(event) => update({ lecturersFemale: parseCount(event.target.value) })} /></label>
                <label>นักศึกษาชาย<input inputMode="numeric" value={countField(draft.postsecondaryMale)} onChange={(event) => update({ postsecondaryMale: parseCount(event.target.value) })} /></label>
                <label>นักศึกษาหญิง<input inputMode="numeric" value={countField(draft.postsecondaryFemale)} onChange={(event) => update({ postsecondaryFemale: parseCount(event.target.value) })} /></label>
                <label>นักศึกษาปีก่อนหน้า<input inputMode="numeric" value={countField(draft.previousStudents)} onChange={(event) => update({ previousStudents: parseCount(event.target.value) })} /></label>
                <label>อาจารย์ปีก่อนหน้า<input inputMode="numeric" value={countField(draft.previousTeachers)} onChange={(event) => update({ previousTeachers: parseCount(event.target.value) })} /></label>
              </div>
            </fieldset>
          )}

          {draft.kind === 'lifelong' && (
            <fieldset>
              <legend>การเรียนรู้ตลอดชีวิต</legend>
              <div className="school-return__pair">
                <label>ผู้ลงทะเบียน<input inputMode="numeric" value={countField(draft.registered)} onChange={(event) => update({ registered: parseCount(event.target.value) })} /></label>
                <label>ผู้จบหรือผ่านกิจกรรม<input inputMode="numeric" value={countField(draft.completed)} onChange={(event) => update({ completed: parseCount(event.target.value) })} /></label>
              </div>
              <p>ผู้ลงทะเบียนอาจเป็นจำนวนครั้งการเข้าร่วม ไม่ใช่บุคคลไม่ซ้ำ ตามนิยามของเว็บไซต์</p>
            </fieldset>
          )}

          <fieldset>
            <legend>ผู้เรียนที่มีความพิการในความดูแลของสถานศึกษา</legend>
            <label>จำนวนคน<input inputMode="numeric" value={countField(draft.learnersWithDisability)} onChange={(event) => update({ learnersWithDisability: parseCount(event.target.value) })} /></label>
            <p>ช่องนี้เป็นตัวเลขที่สถานศึกษารายงานเอง และไม่ถูกนำไปบวกรวมกับจำนวนนักเรียนด้านบน</p>
          </fieldset>
          <div className="school-return__actions">
            <button type="submit">บันทึกบนเครื่องนี้</button>
            <button type="button" onClick={() => window.print()}>พิมพ์หรือบันทึก PDF</button>
            <button type="button" onClick={() => void copySummary()}>คัดลอกสรุปเพื่อแชร์</button>
          </div>
          {notice && <p className="school-return__notice" role="status">{notice}</p>}
        </form>

        <section className="school-return__report" aria-label="สรุปสถิติของสถานศึกษา">
          <p className="school-return__eyebrow">School return</p>
          <h2>{draft.schoolName || 'สรุปจะปรากฏเมื่อกรอกชื่อสถานศึกษา'}</h2>
          <p>{[draft.district, jurisdictionLabel, kindLabel, `ปีการศึกษา ${draft.academicYearBE}`].filter(Boolean).join(' · ')}</p>
          <dl>
            <div><dt>{draft.kind === 'lifelong' ? 'ผู้ลงทะเบียน' : draft.kind === 'postsecondary' ? 'นักศึกษา' : 'นักเรียน'}</dt><dd>{formatCount(draft.kind === 'lifelong' ? draft.registered : summary.students)} คน</dd></div>
            <div><dt>{draft.kind === 'postsecondary' ? 'อาจารย์' : draft.kind === 'lifelong' ? 'ผู้จบหรือผ่าน' : 'ครู'}</dt><dd>{formatCount(draft.kind === 'lifelong' ? draft.completed : summary.teachers)} คน</dd></div>
            {draft.kind === 'basic' && <div><dt>ห้องเรียน</dt><dd>{formatCount(summary.classrooms)} ห้อง</dd></div>}
            <div><dt>นักเรียนต่อครู</dt><dd>{formatRatio(summary.studentsPerTeacher)} <small>ค่าคำนวณ</small></dd></div>
            {draft.kind === 'basic' && <div><dt>นักเรียนต่อห้อง</dt><dd>{formatRatio(summary.studentsPerClassroom)} <small>ค่าคำนวณ</small></dd></div>}
            <div><dt>สัดส่วนผู้เรียนหญิง</dt><dd>{summary.femaleStudentShare === null ? '—' : `${(summary.femaleStudentShare * 100).toFixed(1)}%`} <small>ค่าคำนวณ</small></dd></div>
            <div><dt>เปลี่ยนจากปีก่อน</dt><dd>{formatPercent(summary.studentChange)} <small>ค่าคำนวณ</small></dd></div>
            {draft.kind === 'lifelong' && <div><dt>อัตราจบหรือผ่าน</dt><dd>{summary.completionRate === null ? '—' : `${(summary.completionRate * 100).toFixed(1)}%`} <small>ค่าคำนวณ</small></dd></div>}
            {draft.dropoutStudents !== null && <div><dt>ออกกลางคัน</dt><dd>{formatCount(draft.dropoutStudents)} คน</dd></div>}
            {draft.learnersWithDisability !== null && <div><dt>ผู้เรียนที่มีความพิการ</dt><dd>{formatCount(draft.learnersWithDisability)} คน</dd></div>}
          </dl>
          {draft.kind === 'basic' && (
            <table>
              <caption>ระดับที่รวมจากชั้นเรียน</caption>
              <thead><tr><th>ระดับ</th><th>ห้อง</th><th>ครู</th><th>นักเรียน</th><th>ต่อห้อง</th><th>ต่อครู</th></tr></thead>
              <tbody>
                {summary.levelRows.filter((row) => row.classrooms !== null || row.teachers !== null || row.students !== null).map((row) => (
                  <tr key={row.id}>
                    <th scope="row">{row.label}</th>
                    <td>{formatCount(row.classrooms)}</td>
                    <td>{formatCount(row.teachers)}</td>
                    <td>{formatCount(row.students)}</td>
                    <td>{formatRatio(row.studentsPerClassroom)}</td>
                    <td>{formatRatio(row.studentsPerTeacher)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          <p className="school-return__source">รายงานนี้จัดทำจากข้อมูลที่สถานศึกษากรอกบนเครื่องนี้ เพื่อส่งหรือแชร์ให้หน่วยงานต้นสังกัด ไม่ได้นำเข้าชุดรายงานสถิติจังหวัด และไม่ถูกนำไปบวกกับนักเรียน 115,123 คน</p>
        </section>
      </div>
    </div>
  );
}
