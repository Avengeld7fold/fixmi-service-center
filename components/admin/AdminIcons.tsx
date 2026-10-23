import type { SVGProps } from "react";

// Original web vectors: optical 20-unit grid, macOS symbol metaphors.
// These are not extracted SF Symbols or an Apple font.
type Props = SVGProps<SVGSVGElement> & { size?: number; strokeWidth?: number };
const paths = {
  window: "M3.5 3.5h13a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2ZM7 3.5v13M3.8 7h1M3.8 10h1M3.8 13h1",
  table: "M3.5 3.5h13a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2h-13a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2ZM1.5 7.5h17M1.5 12h17M7.5 7.5v9",
  tag: "M2 4.5A2 2 0 0 1 4 2.5h5.3l8.2 8.2a1.6 1.6 0 0 1 0 2.3l-4.4 4.4a1.6 1.6 0 0 1-2.3 0L2 8.6ZM5.6 5.5h.01",
  photos: "M5 2h11.5A1.5 1.5 0 0 1 18 3.5V14M3 5h11.5A1.5 1.5 0 0 1 16 6.5v10a1.5 1.5 0 0 1-1.5 1.5H3a1.5 1.5 0 0 1-1.5-1.5v-10A1.5 1.5 0 0 1 3 5ZM2 15l4-4 3 3 2-2 4.5 4.5M11.5 8.5h.01",
  history: "M3 6.5A7.5 7.5 0 1 1 2.6 13M2.5 2.5v4.8h4.8M10 5.5v5l3.1 1.8",
  trash: "M3 5h14M7 5V3.2A1.2 1.2 0 0 1 8.2 2h3.6A1.2 1.2 0 0 1 13 3.2V5M4.5 5l.6 11.3A1.8 1.8 0 0 0 6.9 18h6.2a1.8 1.8 0 0 0 1.8-1.7L15.5 5M8 8v7M12 8v7",
  search: "M14.5 8a6 6 0 1 1-12 0 6 6 0 0 1 12 0ZM12.4 12.4l5.1 5.1",
  eye: "M1.5 10S4.5 4.5 10 4.5 18.5 10 18.5 10 15.5 15.5 10 15.5 1.5 10 1.5 10ZM12.8 10a2.8 2.8 0 1 1-5.6 0 2.8 2.8 0 0 1 5.6 0Z",
  upload: "M10 12V1.8M6.5 5.2 10 1.8l3.5 3.4M4.5 9H3a1.5 1.5 0 0 0-1.5 1.5v6A1.5 1.5 0 0 0 3 18h14a1.5 1.5 0 0 0 1.5-1.5v-6A1.5 1.5 0 0 0 17 9h-1.5",
  download: "M10 2v10M6.5 8.5 10 12l3.5-3.5M3 12v4.5A1.5 1.5 0 0 0 4.5 18h11a1.5 1.5 0 0 0 1.5-1.5V12",
  external: "M11 2.5h6.5V9M17.5 2.5l-9 9M7 3H4a1.5 1.5 0 0 0-1.5 1.5v12A1.5 1.5 0 0 0 4 18h11.5a1.5 1.5 0 0 0 1.5-1.5V13",
  logout: "M8 3H4a1.5 1.5 0 0 0-1.5 1.5v11A1.5 1.5 0 0 0 4 17h4M7 10h11M14.5 6.5 18 10l-3.5 3.5",
  sync: "M3 7a7.5 7.5 0 0 1 12.5-3L18 6.5M18 2v4.5h-4.5M17 13a7.5 7.5 0 0 1-12.5 3L2 13.5M2 18v-4.5h4.5",
  camera: "M3 5.5h3l1.5-3h5l1.5 3h3a1.5 1.5 0 0 1 1.5 1.5v9a1.5 1.5 0 0 1-1.5 1.5H3A1.5 1.5 0 0 1 1.5 16V7A1.5 1.5 0 0 1 3 5.5ZM13.5 11a3.5 3.5 0 1 1-7 0 3.5 3.5 0 0 1 7 0Z",
  clock: "M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0ZM10 5v5l3 2",
  check: "M3.5 10 8 14.5 16.5 5.5",
  checked: "M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0ZM6 10l2.7 2.7L14 7",
  warning: "M8.7 2.7a1.5 1.5 0 0 1 2.6 0l7.1 12.6a1.5 1.5 0 0 1-1.3 2.2H2.9a1.5 1.5 0 0 1-1.3-2.2ZM10 7v4M10 14h.01",
  info: "M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0ZM10 6v5M10 14h.01",
  file: "M11.5 2H5a1.5 1.5 0 0 0-1.5 1.5v13A1.5 1.5 0 0 0 5 18h10a1.5 1.5 0 0 0 1.5-1.5v-10ZM11.5 2v4.5h5M6.5 10h7M6.5 13h7M10 10v6",
  filecheck: "M11.5 2H5a1.5 1.5 0 0 0-1.5 1.5v13A1.5 1.5 0 0 0 5 18h10a1.5 1.5 0 0 0 1.5-1.5v-10ZM11.5 2v4.5h5M6.5 12l2.5 2.5 4.5-5",
  copy: "M6 2h10.5A1.5 1.5 0 0 1 18 3.5V14M3.5 5H13a1.5 1.5 0 0 1 1.5 1.5v10A1.5 1.5 0 0 1 13 18H3.5A1.5 1.5 0 0 1 2 16.5v-10A1.5 1.5 0 0 1 3.5 5ZM5 11l2.5 2.5 4-4",
  calendar: "M4 4h12a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2ZM2 8h16M6 2v4M14 2v4M6 11h1M10 11h1M14 11h.01M6 14h1M10 14h1",
  message: "M18 9c0 4-3.5 7-8 7H6l-4 2 1-4C2 12.5 1.5 11 1.5 9c0-4 3.5-7 8.5-7s8 3 8 7Z",
  lock: "M6 8V5.5a4 4 0 0 1 8 0V8M5 8h10a1.5 1.5 0 0 1 1.5 1.5v7A1.5 1.5 0 0 1 15 18H5a1.5 1.5 0 0 1-1.5-1.5v-7A1.5 1.5 0 0 1 5 8ZM10 12v2",
  shield: "M10 1.5 17 4v6c0 4-3 6.5-7 8.5-4-2-7-4.5-7-8.5V4ZM6.5 9.5 9 12l4.5-5",
  plus: "M10 3v14M3 10h14", close: "m5 5 10 10M15 5 5 15",
  down: "m5 7.5 5 5 5-5", right: "m7.5 5 5 5-5 5",
  arrowdown: "M10 2v15M4.5 11.5 10 17l5.5-5.5", arrowup: "M10 18V3M4.5 8.5 10 3l5.5 5.5",
  menu: "M3 6h14M3 10h14M3 14h14", more: "M4 10h.01M10 10h.01M16 10h.01",
} as const;
function symbol(name: keyof typeof paths) {
  return function Symbol({ size = 20, strokeWidth = 1.45, className = "", ...props }: Props) {
    return <svg width={size} height={size} viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className={`admin-symbol ${className}`} {...props}><path d={paths[name]} /></svg>;
  };
}
export const LayoutDashboard = symbol("window"), ReceiptText = symbol("table"), Sparkles = symbol("tag"), Tag = symbol("tag"), Images = symbol("photos"), ArchiveRestore = symbol("history"), RotateCcw = symbol("history"), Trash2 = symbol("trash"), Search = symbol("search"), Eye = symbol("eye"), Upload = symbol("upload"), Download = symbol("download"), ExternalLink = symbol("external"), LogOut = symbol("logout"), RefreshCw = symbol("sync"), Camera = symbol("camera"), Clock = symbol("clock"), Check = symbol("check"), CheckCircle2 = symbol("checked"), TriangleAlert = symbol("warning"), AlertTriangle = symbol("warning"), AlertCircle = symbol("info"), FileSpreadsheet = symbol("file"), FileCheck = symbol("filecheck"), CopyCheck = symbol("copy"), Calendar = symbol("calendar"), MessageCircle = symbol("message"), Lock = symbol("lock"), ShieldCheck = symbol("shield"), Plus = symbol("plus"), X = symbol("close"), ChevronDown = symbol("down"), ChevronRight = symbol("right"), ArrowDown = symbol("arrowdown"), ArrowUp = symbol("arrowup"), Menu = symbol("menu"), MoreHorizontal = symbol("more");
