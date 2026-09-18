import {
  corridor,
  referenceOutline,
  referenceStores,
} from "./reference-layout";

import { upperStores, upperAnchors } from "./upper-floor-layout";
export function ReferenceFloor({
  selectedId,
  floorId = "g",
}: {
  selectedId?: string;
  floorId?: string;
}) {
  const upper = ["l1", "l2", "l3"].includes(floorId);
  const stores = upper
    ? upperStores.filter((s) => s.floorId === floorId)
    : referenceStores;
  const anchors = upper
    ? upperAnchors[floorId as keyof typeof upperAnchors]
    : ["ZARA", "SEPHORA", ""];
  // Subdivide the curved concourse into narrow retail units on both sides.
  const units = corridor.slice(0, -1).flatMap((a, i) => {
    const b = corridor[i + 1],
      dx = b[0] - a[0],
      dy = b[1] - a[1],
      length = Math.hypot(dx, dy);
    const nx = -dy / length,
      ny = dx / length;
    return [-1, 1].flatMap((side) =>
      Array.from({ length: 3 }, (_, j) => {
        const t = j / 3,
          u = (j + 1) / 3;
        return [
          [a[0] + dx * t + nx * side * 24, a[1] + dy * t + ny * side * 24],
          [a[0] + dx * u + nx * side * 24, a[1] + dy * u + ny * side * 24],
          [a[0] + dx * u + nx * side * 94, a[1] + dy * u + ny * side * 94],
          [a[0] + dx * t + nx * side * 94, a[1] + dy * t + ny * side * 94],
        ];
      }),
    );
  });
  const selected = stores.find((s) => `ref-${s.id}` === selectedId);
  return (
    <g className="reference-floor">
      <defs>
        <clipPath id="reference-shell">
          <path d={referenceOutline} />
        </clipPath>
        <filter id="reference-paper">
          <feTurbulence
            type="fractalNoise"
            baseFrequency=".7"
            numOctaves="2"
            stitchTiles="stitch"
          />
          <feColorMatrix type="saturate" values="0" />
          <feComponentTransfer>
            <feFuncA type="linear" slope=".07" />
          </feComponentTransfer>
        </filter>
        <filter
          id={`unit-shadow-${floorId}`}
          x="-20%"
          y="-20%"
          width="150%"
          height="160%"
        >
          <feDropShadow
            dx="2"
            dy="5"
            stdDeviation="3"
            floodColor="#66706f"
            floodOpacity=".2"
          />
        </filter>
        <linearGradient id={`unit-face-${floorId}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#f0f1f0" />
        </linearGradient>
      </defs>
      <g aria-hidden="true">
        <path
          d="M110 -70L-70 390M1070 -80L686 1090"
          stroke="#b7bdbb"
          strokeWidth="21"
        />
        <path
          d="M110 -70L-70 390M1070 -80L686 1090"
          stroke="#eceeed"
          strokeWidth="15"
        />
        <path d="M961 205L733 976" id="reference-road" fill="none" />
        <text fontSize="9" fill="#626a69">
          <textPath href="#reference-road" startOffset="30%">
            VICTORIA STREET WEST
          </textPath>
        </text>
        <path
          d="M95 295Q113 286 135 309L263 606Q270 626 246 679Q237 701 220 697L85 652Q67 643 75 621Q92 586 63 577L8 562Q-9 555 6 528L81 316Q88 299 95 295ZM51 711Q71 704 110 725L189 756Q216 766 199 800L163 883L-15 960L-65 755Z"
          fill="#e4e1da"
        />
        <path
          d="M338 626L453 670L584 800L686 806L605 1070L184 1070Z"
          fill="#d2d2d0"
          stroke="#e6e3dc"
          strokeWidth="6"
        />
        <path
          d="M338 626L453 670L584 800L686 806L605 1070L184 1070Z"
          filter="url(#reference-paper)"
        />
        <path d="M-40 961L73 934L103 971L72 1080L-50 1080Z" fill="#8bcde0" />
        <path
          d="M870 735L924 555L1008 589L961 780Z M814 939L900 891L970 944L928 1068L790 1073Z"
          fill="#ebece9"
          stroke="#d6d7d2"
          strokeWidth="3"
        />
        {upper && (
          <g>
            <path
              d="M338 626L453 670L400 835L293 795Z"
              fill="white"
              stroke="#dedbd3"
              strokeWidth="4"
            />
            <text
              x="375"
              y="738"
              transform="rotate(-70 375 738)"
              textAnchor="middle"
              fontFamily="Georgia,serif"
              fontSize="29"
              fill="#222"
            >
              {anchors[2]}
            </text>
            <text x="115" y="508" fill="#858782" fontSize="13">
              Ⓟ Parking Lot A
            </text>
            <text x="45" y="820" fill="#858782" fontSize="13">
              Ⓟ Parking Lot B
            </text>
          </g>
        )}
        <path d={referenceOutline} transform="translate(0 5)" fill="#cecac2" />
        <path
          d={referenceOutline}
          fill="#e7e8e7"
          stroke="#e4e1d9"
          strokeWidth="5"
        />
        <g clipPath="url(#reference-shell)">
          <g
            className="reference-unit-depth"
            transform="translate(3 7)"
            opacity=".88"
          >
            {units.map((points, i) => (
              <polygon
                key={`depth-${i}`}
                points={points.map((p) => p.join(",")).join(" ")}
                fill="#c9cdcb"
                stroke="#bec3c1"
                strokeWidth="1"
              />
            ))}
          </g>
          <g filter={`url(#unit-shadow-${floorId})`}>
            {units.map((points, i) => (
              <polygon
                key={i}
                points={points.map((p) => p.join(",")).join(" ")}
                fill={`url(#unit-face-${floorId})`}
                stroke="#d4d8d6"
                strokeWidth="1.15"
              />
            ))}
          </g>
          <path
            d="M516 27L593 41L653 125L597 157L533 119Z"
            fill="#fff"
            stroke="#e7e7e4"
          />
          <path
            d="M676 157L729 109L817 226L756 272L729 227Z"
            fill="#fff"
            stroke="#e7e7e4"
          />
          <text
            x="557"
            y="81"
            transform="rotate(28 557 81)"
            fontFamily="Georgia,serif"
            fontSize={upper ? 18 : 29}
            fill="#141414"
            textAnchor="middle"
          >
            {anchors[0]}
          </text>
          <text
            x="733"
            y="198"
            transform="rotate(54 733 198)"
            fontSize="24"
            letterSpacing={upper ? 2 : 5}
            fill="#161616"
            textAnchor="middle"
          >
            {anchors[1]}
          </text>
          <circle cx="638" cy="261" r="48" fill="#d0d1cf" />
          <circle cx="638" cy="261" r="14" fill="#c5d5dd" stroke="#c3c8c7" />
          <circle cx="414" cy="145" r="26" fill="#d0d1cf" />
          <path d="M414 145H436V174H411Z" fill="#e7e8e7" />
          <circle cx="673" cy="507" r="27" fill="#d0d1cf" />
          <path d="M651 489L684 500L675 522L648 511Z" fill="#e7e8e7" />
          <circle cx="506" cy="678" r="39" fill="#d0d1cf" />
          {[0, 1, 2, 3, 4].map((i) => (
            <rect
              key={i}
              x={491 + i * 7}
              y={648 + (i % 2) * 14}
              width="7"
              height="7"
              fill="#e8e9e7"
              transform={`rotate(20 ${491 + i * 7} 655)`}
            />
          ))}
          <path d="M225 130H272M230 135H277" stroke="#c3c9cc" strokeWidth="3" />
          {selected && (
            <path
              d={`M${selected.x - 21} ${selected.y - 16}l43 -7 8 36 -44 9Z`}
              fill="#999b9a"
            />
          )}
        </g>
        <path
          d="M328 487L373 457A74 74 0 0 1 447 391L491 357A111 111 0 1 1 328 487Z"
          fill={upper ? "#d5eaf5" : "#e5e2db"}
        />
        {[190, 220, 250, 280].map((angle) => (
          <path
            key={angle}
            d="M301 397L357 397L357 435L298 435Z"
            transform={`rotate(${angle - 190} 409 421)`}
            fill="#e8e9e8"
            stroke="#e1ded6"
            strokeWidth="5"
          />
        ))}
        {stores.map((s, i) => (
          <circle
            key={s.id}
            cx={s.x + (i % 2 ? 14 : -15)}
            cy={s.y + 27}
            r="3"
            fill={s.color}
          />
        ))}
        {[
          [180, 166],
          [617, 532],
          [425, 895],
        ].map(([x, y], i) => (
          <g key={i} transform={`translate(${x} ${y})`}>
            <circle r="10" fill="#39ac40" stroke="white" strokeWidth="2" />
            <text
              textAnchor="middle"
              y="4"
              fill="white"
              fontSize="12"
              fontWeight="bold"
            >
              $
            </text>
          </g>
        ))}
      </g>
    </g>
  );
}
