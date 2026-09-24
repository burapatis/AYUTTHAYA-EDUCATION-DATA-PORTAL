import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const dataDirectory = new URL('../src/data/v1/', import.meta.url);
const readJson = async (fileName) => JSON.parse(await readFile(new URL(fileName, dataDirectory), 'utf8'));
const sum = (records, key) => records.reduce((total, record) => total + record[key], 0);

const [manifest, overview, districts, students, teachers, dropout, postsecondary, lifelongLearning, localEducation, definitions] = await Promise.all([
  readJson('manifest.json'),
  readJson('overview.json'),
  readJson('districts.json'),
  readJson('students.json'),
  readJson('teachers.json'),
  readJson('dropout.json'),
  readJson('postsecondary.json'),
  readJson('lifelong-learning.json'),
  readJson('local-education.json'),
  readJson('definitions.json'),
]);

assert.equal(manifest.schemaVersion, '1.0.0', 'Unexpected data schema version');
assert.equal(manifest.datasets.length, 9, 'Manifest must list every downloadable dataset');
assert.equal(districts.records.length, overview.summary.districts, 'District record count does not match overview');
assert.equal(sum(districts.records, 'schools'), overview.summary.schools, 'District school total does not match overview');
assert.equal(sum(districts.records, 'classrooms'), overview.summary.classrooms, 'District classroom total does not match overview');
assert.equal(sum(districts.records, 'teachers'), overview.summary.teachers, 'District teacher total does not match overview');
assert.equal(sum(districts.records, 'students'), overview.summary.students, 'District student total does not match overview');
assert.equal(sum(students.levels, 'total'), overview.summary.students, 'Student level total does not match overview');
assert.ok(students.levels.every((record) => record.male + record.female === record.total), 'Student level gender subtotal mismatch');
assert.ok(students.grades.every((record) => record.male + record.female === record.total), 'Student grade gender subtotal mismatch');
assert.equal(sum(teachers.qualifications, 'total'), overview.summary.teachers, 'Teacher qualification total does not match overview');
assert.equal(sum(teachers.teachingLevels, 'total'), overview.summary.teachers, 'Teacher level total does not match overview');
assert.ok(teachers.teachingLevels.every((record) => record.male + record.female === record.total), 'Teacher gender subtotal mismatch');
assert.equal(sum(dropout.latestCauses, 'total'), overview.summary.dropoutStudents, 'Dropout cause total does not match overview');
assert.ok(postsecondary.records.every((record) => record.maleStudents + record.femaleStudents === record.students), 'Postsecondary gender subtotal mismatch');
assert.equal(lifelongLearning.records.length, 8, 'Unexpected lifelong learning activity count');
assert.equal(localEducation.districts.length, overview.summary.districts, 'Local education must cover every district');
assert.equal(sum(localEducation.districts, 'schools'), localEducation.summary.schools, 'Local school total mismatch');
assert.equal(sum(localEducation.districts, 'classrooms'), localEducation.summary.classrooms, 'Local classroom total mismatch');
assert.equal(sum(localEducation.districts, 'teachers'), localEducation.summary.teachers, 'Local teacher total mismatch');
assert.equal(sum(localEducation.districts, 'students'), localEducation.summary.students, 'Local student total mismatch');
assert.equal(sum(localEducation.levels, 'total'), localEducation.summary.students, 'Local education level total mismatch');
assert.ok(localEducation.levels.every((record) => record.male + record.female === record.total), 'Local level gender subtotal mismatch');
assert.equal(sum(localEducation.grades, 'total'), localEducation.summary.students, 'Local grade total mismatch');
assert.ok(localEducation.grades.every((record) => record.male + record.female === record.total), 'Local grade gender subtotal mismatch');
assert.equal(localEducation.districts.filter((record) => record.schools > 0).length, localEducation.summary.districtsWithSchools, 'Local district coverage mismatch');
const definitionRecords = definitions.categories.flatMap((category) => category.definitions);
assert.ok(definitionRecords.length >= 20, 'Data dictionary is missing important definitions');
assert.equal(new Set(definitionRecords.map((record) => record.id)).size, definitionRecords.length, 'Definition IDs must be unique');
assert.ok(definitionRecords.every((record) => record.termTh && record.definitionTh && record.unitTh && record.comparisonTh), 'Definition fields must be complete');

console.log('Data validation passed: schema, record counts, totals, gender subtotals, local education, and definitions are consistent.');
