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

export const schoolReturnGrades = [
  { id: 'early-childhood', label: 'เด็กเล็ก', levelId: 'pre-elementary' },
  { id: 'kg1', label: 'อนุบาล 1', levelId: 'pre-elementary' },
  { id: 'kg2', label: 'อนุบาล 2', levelId: 'pre-elementary' },
  { id: 'kg3', label: 'อนุบาล 3', levelId: 'pre-elementary' },
  { id: 'p1', label: 'ประถม 1', levelId: 'elementary' },
  { id: 'p2', label: 'ประถม 2', levelId: 'elementary' },
  { id: 'p3', label: 'ประถม 3', levelId: 'elementary' },
  { id: 'p4', label: 'ประถม 4', levelId: 'elementary' },
  { id: 'p5', label: 'ประถม 5', levelId: 'elementary' },
  { id: 'p6', label: 'ประถม 6', levelId: 'elementary' },
  { id: 'm1', label: 'มัธยม 1', levelId: 'lower-secondary' },
  { id: 'm2', label: 'มัธยม 2', levelId: 'lower-secondary' },
  { id: 'm3', label: 'มัธยม 3', levelId: 'lower-secondary' },
  { id: 'm4', label: 'มัธยม 4', levelId: 'upper-secondary' },
  { id: 'm5', label: 'มัธยม 5', levelId: 'upper-secondary' },
  { id: 'm6', label: 'มัธยม 6', levelId: 'upper-secondary' },
] as const;

export type SchoolLevelId = (typeof schoolReturnLevels)[number]['id'];
export type SchoolGradeId = (typeof schoolReturnGrades)[number]['id'];
export type SchoolJurisdictionId = (typeof schoolReturnJurisdictions)[number]['id'];
export type SchoolKindId = (typeof schoolReturnKinds)[number]['id'];

export interface LevelCounts {
  teachersMale: number | null;
  teachersFemale: number | null;
}

export interface GradeCounts {
  classrooms: number | null;
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
  grades: Record<SchoolGradeId, GradeCounts>;
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
  teachersMale: null,
  teachersFemale: null,
});

const emptyGrade = (): GradeCounts => ({
  classrooms: null,
  studentsMale: null,
  studentsFemale: null,
});

function gradeMap(): Record<SchoolGradeId, GradeCounts> {
  return Object.fromEntries(schoolReturnGrades.map((grade) => [grade.id, emptyGrade()])) as Record<SchoolGradeId, GradeCounts>;
}

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
    grades: gradeMap(),
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
  gradeRows: Array<{ id: SchoolGradeId; label: string; levelId: SchoolLevelId; classrooms: number | null; students: number | null }>;
}

export function gradesForLevel(levelId: SchoolLevelId) {
  return schoolReturnGrades.filter((grade) => grade.levelId === levelId);
}

export function summarizeSchoolReturn(record: SchoolReturn): SchoolReturnSummary {
  const levelRows = schoolReturnLevels.map((level) => {
    const grades = gradesForLevel(level.id);
    const classrooms = add(grades.map((grade) => record.grades[grade.id].classrooms));
    const studentsMale = add(grades.map((grade) => record.grades[grade.id].studentsMale));
    const studentsFemale = add(grades.map((grade) => record.grades[grade.id].studentsFemale));
    const students = add([studentsMale, studentsFemale]);
    const teachers = add([record.levels[level.id].teachersMale, record.levels[level.id].teachersFemale]);
    return {
      id: level.id,
      label: level.label,
      classrooms,
      teachers,
      students,
      studentsPerClassroom: ratio(students, classrooms),
      studentsPerTeacher: ratio(students, teachers),
    };
  });
  const basicStudentsMale = add(schoolReturnGrades.map((grade) => record.grades[grade.id].studentsMale));
  const basicStudentsFemale = add(schoolReturnGrades.map((grade) => record.grades[grade.id].studentsFemale));
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
    gradeRows: schoolReturnGrades.map((grade) => {
      const counts = record.grades[grade.id];
      return {
        id: grade.id,
        label: grade.label,
        levelId: grade.levelId,
        classrooms: counts.classrooms,
        students: add([counts.studentsMale, counts.studentsFemale]),
      };
    }),
  };
}

export function normalizeSchoolReturn(value: Partial<SchoolReturn> | null | undefined): SchoolReturn {
  const base = createSchoolReturn(typeof value?.id === 'string' ? value.id : '');
  if (!value) return base;
  const levels = { ...base.levels };
  for (const level of schoolReturnLevels) {
    const incoming = value.levels?.[level.id];
    if (!incoming) continue;
    levels[level.id] = {
      teachersMale: incoming.teachersMale ?? null,
      teachersFemale: incoming.teachersFemale ?? null,
    };
  }
  const grades = gradeMap();
  for (const grade of schoolReturnGrades) {
    const incoming = value.grades?.[grade.id];
    if (!incoming) continue;
    grades[grade.id] = {
      classrooms: incoming.classrooms ?? null,
      studentsMale: incoming.studentsMale ?? null,
      studentsFemale: incoming.studentsFemale ?? null,
    };
  }
  return {
    ...base,
    ...value,
    jurisdiction: schoolReturnJurisdictions.some((item) => item.id === value.jurisdiction) ? value.jurisdiction! : base.jurisdiction,
    kind: schoolReturnKinds.some((item) => item.id === value.kind) ? value.kind! : base.kind,
    academicYearBE: value.academicYearBE ?? base.academicYearBE,
    levels,
    grades,
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
