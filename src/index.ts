import { RemObserver } from "./utils/RemObserver";

export class TileExpert
{
    private m_container: HTMLElement;
    private m_dir: "horizontal" | "vertical";
    private m_rtl: boolean;
    private m_label_class_name: string;
    private m_tile_class_name: string;
    private m_small_size: number;
    private m_tile_gap: number;
    private m_group_gap: number;
    private m_group_label_height: number;
    private m_rem_observer: RemObserver;
    private m_rem: number;
    private m_max_widtH: number;
    private m_max_height: number;

    constructor(options: {
        element: Element,
        direction: "horizontal" | "vertical",
        rtl: boolean,
        labelClassName: string,
        tileClassName: string,
        smallSize: number,
        tileGap: number,
        groupGap: number,
        groupLabelHeight: number,
        maxWidth?: number,
        maxHeight?: number,
    }) {
        this.m_container = options.element as HTMLElement;
        this.m_dir = options.direction;
        this.m_rtl = options.rtl;
        this.m_label_class_name = options.labelClassName;
        this.m_tile_class_name = options.tileClassName;
        this.m_small_size = options.smallSize;
        this.m_tile_gap = options.tileGap;
        this.m_group_gap = options.groupGap;
        this.m_group_label_height = options.groupLabelHeight;
        this.m_max_widtH = options.maxWidth ?? Infinity;
        this.m_max_height = options.maxHeight ?? Infinity;

        this.m_rem_observer = new RemObserver(val => {
            this.m_rem = val;
        });
    }

    destroy()
    {
        this.m_rem_observer.cleanup();
    }
}