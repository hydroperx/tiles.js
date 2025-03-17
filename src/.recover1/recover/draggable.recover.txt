import React, { useEffect } from "react";
import ext_Draggable from "com.hydroper.domdraggable";

const at_browser = typeof window !== "undefined";

let pointerMoveHandlers = [];
function window_onPointerMove(e: PointerEvent): void
{
    for (const handler of pointerMoveHandlers)
    {
        handler(e);
    }
}
window.addEventListener("pointermove", window_onPointerMove);

let pointerUpHandlers = [];
function window_onPointerUp(e: PointerEvent): void
{
    for (const handler of pointerUpHandlers)
    {
        handler(e);
    }
}
window.addEventListener("pointerup", window_onPointerUp);
window.addEventListener("pointercancel", window_onPointerUp);

export default function Draggable(options: DraggableOptions)
{
    let {
        dragStart: drag_start,
        dragMove: drag_move,
        dragStop: drag_stop,
        limit,
        element: el_ref,
        children,
        disabled,
    } = options;

    let draggable: ext_Draggable | null = null;

    function createDraggable()
    {
        draggable = new ext_Draggable(el_ref.current!, {
            limit,

            onDragStart(element, x, y, event) {
                drag_start?.({ element: element as HTMLElement, x, y });
            },

            onDrag(element, x, y, event) {
                drag_move?.({ element: element as HTMLElement, x, y });
            },

            onDragEnd(element, x, y, event) {
                /*
                if (finish_parent)
                {
                    if (finish === "translate")
                    {
                        const offsets = utils.getElementRelativeOffset(element, finish_parent);
                        console.log(offsets)
                        const inset_offsets = utils.extractInsetOffsets(element);
                        const lefttop_offsets = utils.extractLeftTopOffsets(element);
                        let x = (offsets.left + inset_offsets.left + lefttop_offsets.left) + "px";
                        let y = (offsets.top + inset_offsets.top + lefttop_offsets.top) + "px";
                        if (rem !== undefined)
                        {
                            x = ((offsets.left + inset_offsets.left + lefttop_offsets.left) / rem) + "rem";
                            y = ((offsets.top + inset_offsets.top + lefttop_offsets.top) / rem) + "rem";
                        }
                        (element as HTMLElement).style.translate = `${x} ${y}`;
                        (element as HTMLElement).style.inset = "";
                    }
                }
                */
                drag_stop?.({ element: element as HTMLElement, x, y });
            },
        });
    }

    useEffect(() => {
        if (!disabled)
        {
            if (draggable) draggable.destroy();
            createDraggable();
        }

        // Cleanup
        return () => {
            if (draggable) draggable.destroy(), draggable = null;
        };
    }, [disabled, limit]);

    useEffect(() => {
        // Cleanup
        return () => {
            if (draggable) draggable.destroy(), draggable = null;
        };
    }, []);

    return (<>
        {children}
    </>);
}

export type DraggableOptions = {
    element: React.MutableRefObject<HTMLElement>,
    limit?: HTMLElement,
    children?: React.ReactNode,
    disabled?: boolean,
    rem?: number,

    dragStart?: (data: DraggableData) => void,
    dragMove?: (data: DraggableData) => void,
    dragStop?: (data: DraggableData) => void,
};

export type DraggableData = {
    element: HTMLElement,
    x: number,
    y: number,
};

const utils = {
    extractInsetOffsets(element: Element): { left: number, top: number }
    {
        const e = element as HTMLElement;
        const { inset } = e.style;
        if (!inset) return { left: 0, top: 0 };
        const m = inset.match(/-?(?:\d*\.\d+|\d+)/g);
        if (!m) return { left: 0, top: 0 };
        return {
            left: parseFloat(m[1]),
            top: parseFloat(m[0]),
        }
    },

    extractLeftTopOffsets(element: Element): { left: number, top: number }
    {
        const e = element as HTMLElement;
        const { left, top } = e.style;
        const m_top = top ? top.match(/-?(?:\d*\.\d+|\d+)/) : "0";
        const m_left = left ? left.match(/-?(?:\d*\.\d+|\d+)/) : "0";
        return {
            left: parseFloat(m_left ? m_left[0] : "0"),
            top: parseFloat(m_top ? m_top[0] : "0"),
        }
    },
};