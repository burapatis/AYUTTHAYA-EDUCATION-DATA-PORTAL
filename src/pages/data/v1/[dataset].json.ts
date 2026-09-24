import type { APIContext } from 'astro';
import manifest from '../../../data/v1/manifest.json';
import overview from '../../../data/v1/overview.json';
import districts from '../../../data/v1/districts.json';
import students from '../../../data/v1/students.json';
import teachers from '../../../data/v1/teachers.json';
import dropout from '../../../data/v1/dropout.json';
import postsecondary from '../../../data/v1/postsecondary.json';
import lifelongLearning from '../../../data/v1/lifelong-learning.json';
import localEducation from '../../../data/v1/local-education.json';
import definitions from '../../../data/v1/definitions.json';

const datasets = {
  manifest,
  overview,
  districts,
  students,
  teachers,
  dropout,
  postsecondary,
  'lifelong-learning': lifelongLearning,
  'local-education': localEducation,
  definitions,
} as const;

export function getStaticPaths() {
  return Object.entries(datasets).map(([dataset, data]) => ({
    params: { dataset },
    props: { data },
  }));
}

export function GET({ props }: APIContext) {
  return new Response(`${JSON.stringify(props.data, null, 2)}\n`, {
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}
