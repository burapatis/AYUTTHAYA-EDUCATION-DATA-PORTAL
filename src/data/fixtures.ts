import manifest from './v1/manifest.json';
import overview from './v1/overview.json';
import districts from './v1/districts.json';
import students from './v1/students.json';
import teachers from './v1/teachers.json';
import dropout from './v1/dropout.json';
import postsecondaryData from './v1/postsecondary.json';
import lifelongLearning from './v1/lifelong-learning.json';

export const sourceLabel = manifest.source.titleTh;
export const academicPeriod = overview.period.labelTh;

export const provinceSummary = overview.summary;

export const studentLevels = students.levels.map((item) => ({
  id: item.id,
  label: item.labelTh,
  total: item.total,
  male: item.male,
  female: item.female,
}));

export const studentGrades = students.grades.map((item) => ({
  label: item.labelTh,
  total: item.total,
  male: item.male,
  female: item.female,
}));

export const studentTrend = students.trend.map((item) => ({
  year: String(item.academicYearBE),
  total: item.total,
}));

export const teacherTrend = teachers.trend.map((item) => ({
  year: String(item.academicYearBE),
  total: item.total,
}));

export const teacherQualifications = teachers.qualifications.map((item) => ({
  label: item.labelTh,
  value: item.total,
}));

export const teacherLevels = teachers.teachingLevels.map((item) => ({
  label: item.labelTh,
  total: item.total,
  male: item.male,
  female: item.female,
}));

export const jurisdictions = overview.jurisdictions.map((item) => ({
  id: item.id,
  label: item.labelTh,
  shortLabel: item.shortLabelTh,
  schools: item.schools,
  classrooms: item.classrooms,
  teachers: item.teachers,
  students: item.students,
}));

export const districtRows = districts.records.map((item) => ({
  id: item.districtCode,
  name: item.districtNameTh,
  schools: item.schools,
  classrooms: item.classrooms,
  teachers: item.teachers,
  students: item.students,
  studentsPerClassroom: item.studentsPerClassroom,
  studentsPerTeacher: item.studentsPerTeacher,
}));

export const dropoutTrend = dropout.trend.map((item) => ({
  year: String(item.academicYearBE),
  value: item.total,
}));

export const dropoutCauses = dropout.latestCauses.map((item) => ({
  label: item.labelTh,
  value: item.total,
}));

export const postsecondary = postsecondaryData.records.map((item) => ({
  id: item.id,
  label: item.labelTh,
  institutions: item.institutions,
  lecturers: item.lecturers,
  students: item.students,
  maleStudents: item.maleStudents,
  femaleStudents: item.femaleStudents,
}));

export const lifelongActivities = lifelongLearning.records.map((item) => ({
  label: item.labelTh,
  registered: item.registered,
  graduated: item.completed,
}));

const statusLabels: Record<string, string> = {
  verified: 'ตรวจสอบแล้ว',
  review_note: 'มีข้อสังเกต',
};

export const catalog = manifest.datasets.map((item) => ({
  id: item.id,
  path: item.path,
  name: item.titleTh,
  coverage: item.coverage,
  period: item.periodLabelTh,
  tables: item.sourceTables.join(', '),
  status: statusLabels[item.status] ?? item.status,
}));

export const formatNumber = (value: number) => new Intl.NumberFormat('th-TH').format(value);
