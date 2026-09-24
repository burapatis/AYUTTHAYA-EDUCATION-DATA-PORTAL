import type { EChartsOption } from 'echarts';

export const chartColors = ['#1769aa', '#236b70', '#7c5aa6', '#758ca3', '#a75151', '#1a4d78'];
export const femaleSeriesColor = '#236b70';
const extremeColor = '#bd8422';

const axisLabel = {
  color: '#64758a',
  fontFamily: '"Noto Sans Thai Variable", "Noto Sans Thai", Leelawadee UI, system-ui, sans-serif',
  fontSize: 11,
};

const base: EChartsOption = {
  animationDuration: 500,
  color: chartColors,
  textStyle: {
    color: '#344354',
    fontFamily: '"Noto Sans Thai Variable", "Noto Sans Thai", Leelawadee UI, system-ui, sans-serif',
  },
  tooltip: {
    trigger: 'axis',
    backgroundColor: 'rgba(7, 26, 47, 0.94)',
    borderWidth: 0,
    textStyle: { color: '#fff', fontSize: 12 },
  },
  aria: { enabled: true },
};

const formatCount = (value: number) => new Intl.NumberFormat('th-TH').format(value);

export function barOption(
  categories: string[],
  values: number[],
  seriesName: string,
  options: { horizontal?: boolean; color?: string; unit?: string; gridLeft?: number; highlightExtremes?: boolean } = {},
): EChartsOption {
  const { horizontal = false, color = chartColors[0], unit = 'คน', gridLeft = horizontal ? 92 : 48, highlightExtremes = false } = options;
  const maximum = Math.max(...values);
  const minimum = Math.min(...values);
  const categoryAxis = {
    type: 'category' as const,
    data: categories,
    axisLine: { lineStyle: { color: '#cbd3dc' } },
    axisTick: { show: false },
    axisLabel: { ...axisLabel, interval: 0 },
  };
  const valueAxis = {
    type: 'value' as const,
    name: unit,
    nameTextStyle: axisLabel,
    axisLabel,
    splitLine: { lineStyle: { color: '#e8edf1' } },
  };
  const data = values.map((value) => {
    const isMaximum = highlightExtremes && value === maximum && maximum !== minimum;
    const isMinimum = highlightExtremes && value === minimum && maximum !== minimum;
    return {
      value,
      itemStyle: {
        color: isMaximum ? extremeColor : isMinimum ? '#f8edda' : color,
        borderColor: isMinimum ? extremeColor : 'transparent',
        borderWidth: isMinimum ? 1.5 : 0,
        borderRadius: horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0],
      },
    };
  });

  return {
    ...base,
    grid: { top: horizontal ? 16 : 36, right: horizontal ? 72 : 16, bottom: horizontal ? 28 : 58, left: gridLeft, containLabel: true },
    xAxis: horizontal ? valueAxis : categoryAxis,
    yAxis: horizontal ? categoryAxis : valueAxis,
    series: [{
      name: seriesName,
      type: 'bar',
      data,
      barMaxWidth: 28,
      label: {
        show: true,
        position: horizontal ? 'right' : 'top',
        formatter: (item) => formatCount(Number(item.value ?? 0)),
        color: '#344354',
        fontSize: 10,
        fontFamily: axisLabel.fontFamily,
      },
      labelLayout: { hideOverlap: true },
    }],
  };
}

export function groupedBarOption(
  categories: string[],
  series: Array<{ name: string; data: number[]; color?: string }>,
  unit = 'คน',
): EChartsOption {
  return {
    ...base,
    legend: { bottom: 0, icon: 'circle', textStyle: axisLabel },
    grid: { top: 36, right: 16, bottom: 58, left: 54, containLabel: true },
    xAxis: {
      type: 'category',
      data: categories,
      axisLine: { lineStyle: { color: '#cbd3dc' } },
      axisTick: { show: false },
      axisLabel: { ...axisLabel, interval: 0 },
    },
    yAxis: {
      type: 'value',
      name: unit,
      nameTextStyle: axisLabel,
      axisLabel,
      splitLine: { lineStyle: { color: '#e8edf1' } },
    },
    series: series.map((item, index) => ({
      name: item.name,
      type: 'bar',
      data: item.data,
      barMaxWidth: 28,
      itemStyle: { color: item.color ?? chartColors[index], borderRadius: [4, 4, 0, 0] },
      label: {
        show: categories.length <= 8,
        position: 'top',
        formatter: (point) => formatCount(Number(point.value ?? 0)),
        color: '#344354',
        fontSize: 10,
        fontFamily: axisLabel.fontFamily,
      },
      labelLayout: { hideOverlap: true },
    })),
  };
}

export function lineOption(
  categories: string[],
  values: number[],
  seriesName: string,
  unit = 'คน',
): EChartsOption {
  return {
    ...base,
    grid: { top: 24, right: 72, bottom: 34, left: 54, containLabel: true },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: categories,
      axisLine: { lineStyle: { color: '#cbd3dc' } },
      axisTick: { show: false },
      axisLabel,
    },
    yAxis: {
      type: 'value',
      name: unit,
      nameTextStyle: axisLabel,
      axisLabel,
      splitLine: { lineStyle: { color: '#e8edf1' } },
    },
    series: [{
      name: seriesName,
      type: 'line',
      data: values,
      showSymbol: true,
      symbolSize: 7,
      smooth: 0.22,
      lineStyle: { color: chartColors[0], width: 3 },
      itemStyle: { color: chartColors[0], borderColor: '#fff', borderWidth: 2 },
      areaStyle: { color: 'rgba(23, 105, 170, 0.10)' },
      endLabel: {
        show: true,
        formatter: (item) => formatCount(Number(item.value ?? 0)),
        color: '#0b2542',
        fontSize: 11,
        fontWeight: 700,
        fontFamily: axisLabel.fontFamily,
      },
    }],
  };
}

export function donutOption(data: Array<{ name: string; value: number }>): EChartsOption {
  return {
    ...base,
    tooltip: { ...base.tooltip, trigger: 'item' },
    legend: { type: 'scroll', bottom: 0, icon: 'circle', textStyle: axisLabel },
    series: [{
      name: 'จำนวน',
      type: 'pie',
      radius: ['48%', '72%'],
      center: ['50%', '42%'],
      avoidLabelOverlap: true,
      itemStyle: { borderColor: '#fff', borderWidth: 3, borderRadius: 4 },
      label: { show: false },
      emphasis: { label: { show: true, fontSize: 13, fontWeight: 'bold' } },
      data,
    }],
  };
}

export function districtMapOption(
  rows: Array<{ name: string; students: number; schools: number; teachers: number; classrooms: number }>,
): EChartsOption {
  const values = rows.map((row) => row.students);
  const format = (value: number) => new Intl.NumberFormat('th-TH').format(value);

  return {
    ...base,
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(7, 26, 47, 0.94)',
      borderWidth: 0,
      textStyle: { color: '#fff', fontSize: 12 },
      formatter: (item) => {
        const point = Array.isArray(item) ? item[0] : item;
        const row = rows.find((entry) => entry.name === point?.name);
        if (!row || !point) return '';
        return [
          row.name,
          `นักเรียน ${format(row.students)} คน`,
          `ครู ${format(row.teachers)} คน`,
          `สถานศึกษา ${format(row.schools)} แห่ง`,
          `ห้องเรียน ${format(row.classrooms)} ห้อง`,
        ].join('<br/>');
      },
    },
    visualMap: {
      min: Math.min(...values),
      max: Math.max(...values),
      text: ['มาก', 'น้อย'],
      calculable: false,
      orient: 'horizontal',
      left: 'center',
      bottom: 0,
      itemWidth: 12,
      itemHeight: 80,
      textStyle: axisLabel,
      inRange: { color: ['#e7f1fa', '#1769aa', '#0b2542'] },
    },
    series: [{
      name: 'นักเรียน',
      type: 'map',
      map: 'ayutthaya',
      roam: false,
      selectedMode: false,
      top: 16,
      bottom: 48,
      left: 24,
      right: 24,
      data: rows.map((row) => ({ name: row.name, value: row.students })),
      itemStyle: { borderColor: '#ffffff', borderWidth: 1.2, areaColor: '#e7f1fa' },
      emphasis: {
        label: { show: true, color: '#071a2f', fontSize: 12, fontWeight: 700 },
        itemStyle: { areaColor: '#bd8422' },
      },
      label: { show: false },
    }],
  };
}
