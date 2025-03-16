declare module "com.hydroper.domdraggable"
{
    export class Draggable
    {
        constructor(element: Element, options?: DraggableOptions);

        get(): { x: number, y: number };
        set(x: number, y: number): void;
        setOption(property: string, value: any): void;

        destroy(): void;
    }

    export type DraggableOptions = {
        grid?: number,
        handle?: Element,
        filterTarget?: (target: Element) => boolean,
        limit?: Element | ((x: any, y: any, x0: any, y0: any) => { x: number, y: number }) | {
            x: number | number[] | null,
            y: number | number[] | null,
        },
        threshold?: number,
        setCursor?: boolean,
        setPosition?: boolean,
        smoothDrag?: boolean,
        useGPU?: boolean,

        onDrag?: (element: Element, x: number, y: number, event: Event) => void,
        onDragStart?: (element: Element, x: number, y: number, event: Event) => void,
        onDragEnd?: (element: Element, x: number, y: number, event: Event) => void,
    };

    export default Draggable;
}