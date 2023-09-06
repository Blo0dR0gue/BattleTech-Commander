import { Planet } from './Planet';
import { Quadtree } from '@timohausmann/quadtree-ts';

class Universe {
  private canvas: HTMLCanvasElement;
  private context: CanvasRenderingContext2D;
  private planets: Planet[];
  private tree: Quadtree<Planet>;

  public constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.context = this.canvas.getContext('2d');
  }

  public init(): void {
    this.tree = new Quadtree({
      height: 5000,
      width: 5000,
      maxObjects: 5,
    });
  }
}

export { Universe };
