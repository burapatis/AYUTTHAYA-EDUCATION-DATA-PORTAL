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
}

export default function EChart({ option, height = 320, ariaLabel, label }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const chart = echarts.init(container, undefined, { renderer: 'svg' });
    chart.setOption(option);

    const observer = new ResizeObserver(() => chart.resize());
    observer.observe(container);

    return () => {
      observer.disconnect();
      chart.dispose();
    };
  }, [option]);

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label={ariaLabel ?? label ?? 'กราฟข้อมูล'}
      style={{ width: '100%', height: `${height}px`, minHeight: '240px' }}
    />
  );
}
