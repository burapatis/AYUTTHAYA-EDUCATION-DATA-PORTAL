import { useEffect, useRef } from 'react';
import * as echarts from 'echarts/core';
import { BarChart, LineChart, MapChart, PieChart } from 'echarts/charts';
import { AriaComponent, GeoComponent, GridComponent, LegendComponent, TooltipComponent, VisualMapComponent } from 'echarts/components';
import { SVGRenderer } from 'echarts/renderers';
import type { EChartsOption } from 'echarts';
import ayutthayaDistricts from '../../data/ayutthaya-districts.geo.json';

echarts.use([
  BarChart,
  LineChart,
  MapChart,
  PieChart,
  AriaComponent,
  GeoComponent,
  GridComponent,
  LegendComponent,
  TooltipComponent,
  VisualMapComponent,
  SVGRenderer,
]);

echarts.registerMap('ayutthaya', ayutthayaDistricts as never);

interface Props {
  option: EChartsOption;
  height?: number;
  ariaLabel?: string;
  label?: string;
  filterId?: string;
  filterMode?: 'exact' | 'through';
  horizontalBelow?: number;
}

type AxisOption = { type?: string; data?: Array<string | number> };

function categoryAxisKey(option: EChartsOption) {
  const xAxis = option.xAxis as AxisOption | undefined;
  const yAxis = option.yAxis as AxisOption | undefined;
  if (xAxis && !Array.isArray(option.xAxis) && xAxis.type === 'category') return 'xAxis' as const;
  if (yAxis && !Array.isArray(option.yAxis) && yAxis.type === 'category') return 'yAxis' as const;
  return null;
}

function presentOption(option: EChartsOption, value: string, mode: 'exact' | 'through', horizontal: boolean): EChartsOption {
  const seriesList = Array.isArray(option.series) ? option.series : [];
  let next = option;

  if (value !== 'all' && seriesList.some((item) => item && item.type === 'map')) {
    next = {
      ...option,
      series: seriesList.map((item) => {
        if (!item || item.type !== 'map' || !Array.isArray(item.data)) return item;
        return {
          ...item,
          data: item.data.map((entry) => {
            if (!entry || typeof entry !== 'object' || !('name' in entry)) return entry;
            const selected = entry.name === value;
            return { ...entry, itemStyle: selected ? { areaColor: '#bd8422' } : { areaColor: '#d5e3ef' } };
          }),
        };
      }),
    };
  } else if (value !== 'all') {
    const key = categoryAxisKey(option);
    const axis = key ? option[key] as AxisOption : undefined;
    const categories = axis?.data ?? [];
    const kept = categories
      .map((category, index) => ({ category, index }))
      .filter(({ category }) => (mode === 'exact' ? String(category) === value : String(category) <= value));
    if (key && axis && kept.length) {
      next = {
        ...option,
        [key]: { ...axis, data: kept.map((item) => item.category) },
        series: seriesList.map((item) => (
          item && Array.isArray(item.data) ? { ...item, data: kept.map(({ index }) => (item.data as unknown[])[index]) } : item
        )),
      } as EChartsOption;
    }
  }

  const axisKey = categoryAxisKey(next);
  if (!horizontal || axisKey !== 'xAxis') return next;
  return {
    ...next,
    grid: { top: 16, right: 64, bottom: 24, left: 8, containLabel: true },
    xAxis: next.yAxis as EChartsOption['xAxis'],
    yAxis: next.xAxis as EChartsOption['yAxis'],
    series: (Array.isArray(next.series) ? next.series : []).map((item) => (
      item && item.type === 'bar' && item.label && typeof item.label === 'object'
        ? { ...item, label: { ...item.label, position: 'right' } }
        : item
    )),
  };
}

export default function EChart({ option, height = 320, ariaLabel, label, filterId, filterMode = 'exact', horizontalBelow }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const chart = echarts.init(container, undefined, { renderer: 'svg' });
    let selected = 'all';

    const render = () => {
      const horizontal = Boolean(horizontalBelow && container.clientWidth < horizontalBelow);
      chart.setOption(presentOption(option, selected, filterMode, horizontal), true);
    };

    const onFilter = (event: Event) => {
      if (!filterId) return;
      const detail = (event as CustomEvent<Record<string, string>>).detail;
      const value = detail?.[filterId];
      if (!value) return;
      selected = value;
      render();
    };

    render();
    document.addEventListener('portal-filter', onFilter);
    const observer = new ResizeObserver(() => {
      render();
      chart.resize();
    });
    observer.observe(container);

    return () => {
      document.removeEventListener('portal-filter', onFilter);
      observer.disconnect();
      chart.dispose();
    };
  }, [option, filterId, filterMode, horizontalBelow]);

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label={ariaLabel ?? label ?? 'กราฟข้อมูล'}
      style={{ width: '100%', height: `${height}px`, minHeight: '240px' }}
    />
  );
}
