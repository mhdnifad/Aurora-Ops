'use client';

import FluidGlass from '@/components/FluidGlass';
import { cn } from '@/lib/utils';

type FluidGlassSurfaceProps = {
  className?: string;
  mode?: 'lens' | 'bar' | 'cube';
};

export function FluidGlassSurface({ className, mode = 'lens' }: FluidGlassSurfaceProps) {
  return (
    <div className={cn('relative h-[520px] w-full overflow-hidden rounded-3xl', className)}>
      <FluidGlass
        mode={mode}
        lensProps={{
          scale: 0.25,
          ior: 1.15,
          thickness: 5,
          chromaticAberration: 0.1,
          anisotropy: 0.01,
        }}
      />
    </div>
  );
}
