export const schoolReturnLevels = [
  { id: 'pre-elementary', label: 'ก่อนประถมศึกษา' },
  { id: 'elementary', label: 'ประถมศึกษา' },
  { id: 'lower-secondary', label: 'มัธยมศึกษาตอนต้น' },
  { id: 'upper-secondary', label: 'มัธยมศึกษาตอนปลาย' },
] as const;

export const schoolReturnJurisdictions = [
  { id: 'obec', label: 'สพฐ.' },
  { id: 'private', label: 'เอกชน' },
  { id: 'local', label: 'ท้องถิ่น' },
  { id: 'other', label: 'ส่วนราชการอื่น' },
] as const;

export const schoolReturnKinds = [
  { id: 'basic', label: 'การศึกษาขั้นพื้นฐาน' },
  { id: 'postsecondary', label: 'อาชีวศึกษาหรืออุดมศึกษา' },
  { id: 'lifelong', label: 'การศึกษานอกระบบหรือการเรียนรู้ตลอดชีวิต' },
] as const;

export type SchoolLevelId = (typeof schoolReturnLevels)[number]['id'];
export type SchoolJurisdictionId = (typeof schoolReturnJurisdictions)[number]['id'];
export type SchoolKindId = (typeof schoolReturnKinds)[number]['id'];

export interface LevelCounts {
  classrooms: number | null;
  teachersMale: number | null;
  teachersFemale: number | null;
  studentsMale: number | null;
  studentsFemale: number | null;
}

export interface SchoolReturn {
  id: string;
  schoolName: string;
  district: string;
  jurisdiction: SchoolJurisdictionId;
  kind: SchoolKindId;
  academicYearBE: number;
  levels: Record<SchoolLevelId, LevelCounts>;
  previousStudents: number | null;
  previousTeachers: number | null;
  dropoutStudents: number | null;
  lecturersMale: number | null;
  lecturersFemale: number | null;
  postsecondaryMale: number | null;
  postsecondaryFemale: number | null;
  registered: number | null;
  completed: number | null;
  learnersWithDisability: number | null;
  updatedAt: string;
}

const emptyLevel = (): LevelCounts => ({
  classrooms: null,
  teachersMale: null,
  teachersFemale: null,
  studentsMale: null,
  studentsFemale: null,
});

export function createSchoolReturn(id = ''): SchoolReturn {
  return {
    id,
    schoolName: '',
    district: '',
    jurisdiction: 'obec',
    kind: 'basic',
    academicYearBE: 2569,
    levels: {
      'pre-elementary': emptyLevel(),
      elementary: emptyLevel(),
      'lower-secondary': emptyLevel(),
      'upper-secondary': emptyLevel(),
    },
    previousStudents: null,
    previousTeachers: null,
    dropoutStudents: null,
    lecturersMale: null,
    lecturersFemale: null,
    postsecondaryMale: null,
    postsecondaryFemale: null,
    registered: null,
    completed: null,
    learnersWithDisability: null,
    updatedAt: '',
  };
}

export function parseCount(value: string): number | null {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (!/^\d+$/.test(trimmed)) return null;
  return Number(trimmed);
}

function add(values: Array<number | null>): number | null {
  const present = values.filter((value): value is number => value !== null);
  if (!present.length) return null;
  return present.reduce((sum, value) => sum + value, 0);
}

export function ratio(numerator: number | null, denominator: number | null): number | null {
  if (numerator === null || denominator === null || denominator === 0) return null;
  return numerator / denominator;
}

export function percentChange(current: number | null, previous: number | null): number | null {
  if (current === null || previous === null || previous === 0) return null;
  return ((current - previous) / previous) * 100;
}

export interface SchoolReturnSummary {
  classrooms: number | null;
  teachers: number | null;
  teachersMale: number | null;
  teachersFemale: number | null;
  students: number | null;
  studentsMale: number | null;
  studentsFemale: number | null;
  studentsPerClassroom: number | null;
  studentsPerTeacher: number | null;
  femaleStudentShare: number | null;
  studentChange: number | null;
  teacherChange: number | null;
  lecturers: number | null;
  postsecondaryStudents: number | null;
  completionRate: number | null;
  levelRows: Array<{ id: SchoolLevelId; label: string; classrooms: number | null; teachers: number | null; students: number | null; studentsPerClassroom: number | null; studentsPerTeacher: number | null }>;
}

export function summarizeSchoolReturn(record: SchoolReturn): SchoolReturnSummary {
  const levelRows = schoolReturnLevels.map((level) => {
    const counts = record.levels[level.id];
    const teachers = add([counts.teachersMale, counts.teachersFemale]);
    const students = add([counts.studentsMale, counts.studentsFemale]);
    return {
      id: level.id,
      label: level.label,
      classrooms: counts.classrooms,
      teachers,
      students,
      studentsPerClassroom: ratio(students, counts.classrooms),
      studentsPerTeacher: ratio(students, teachers),
    };
  });
  const basicStudentsMale = add(schoolReturnLevels.map((level) => record.levels[level.id].studentsMale));
  const basicStudentsFemale = add(schoolReturnLevels.map((level) => record.levels[level.id].studentsFemale));
  const students = record.kind === 'basic' ? add([basicStudentsMale, basicStudentsFemale]) : record.kind === 'postsecondary' ? add([record.postsecondaryMale, record.postsecondaryFemale]) : null;
  const studentsMale = record.kind === 'basic' ? basicStudentsMale : record.kind === 'postsecondary' ? record.postsecondaryMale : null;
  const studentsFemale = record.kind === 'basic' ? basicStudentsFemale : record.kind === 'postsecondary' ? record.postsecondaryFemale : null;
  const teachers = record.kind === 'basic' ? add(levelRows.map((row) => row.teachers)) : null;
  const classrooms = record.kind === 'basic' ? add(levelRows.map((row) => row.classrooms)) : null;
  const lecturers = record.kind === 'postsecondary' ? add([record.lecturersMale, record.lecturersFemale]) : null;
  return {
    classrooms,
    teachers: record.kind === 'postsecondary' ? lecturers : teachers,
    teachersMale: record.kind === 'basic' ? add(schoolReturnLevels.map((level) => record.levels[level.id].teachersMale)) : record.lecturersMale,
    teachersFemale: record.kind === 'basic' ? add(schoolReturnLevels.map((level) => record.levels[level.id].teachersFemale)) : record.lecturersFemale,
    students,
    studentsMale,
    studentsFemale,
    studentsPerClassroom: record.kind === 'basic' ? ratio(students, classrooms) : null,
    studentsPerTeacher: ratio(students, record.kind === 'postsecondary' ? lecturers : teachers),
    femaleStudentShare: ratio(studentsFemale, students),
    studentChange: percentChange(students, record.previousStudents),
    teacherChange: percentChange(record.kind === 'postsecondary' ? lecturers : teachers, record.previousTeachers),
    lecturers,
    postsecondaryStudents: record.kind === 'postsecondary' ? students : null,
    completionRate: record.kind === 'lifelong' ? ratio(record.completed, record.registered) : null,
    levelRows,
  };
}

export function formatCount(value: number | null): string {
  if (value === null) return '—';
  return new Intl.NumberFormat('th-TH').format(value);
}

export function formatRatio(value: number | null): string {
  if (value === null) return '—';
  return value.toLocaleString('th-TH', { maximumFractionDigits: 1, minimumFractionDigits: 1 });
}

export function formatPercent(value: number | null): string {
  if (value === null) return '—';
  const sign = value > 0 ? '+' : value < 0 ? '−' : '';
  return `${sign}${Math.abs(value).toFixed(1)}%`;
}
