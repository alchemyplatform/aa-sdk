export default function BagIcon({
  className,
  color = "#CBD5E1",
}: {
  className?: string;
  color?: string;
}) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g id="bag-04">
        <path
          id="Icon"
          d="M13 7V4.5C13 2.84315 11.6569 1.5 10 1.5C8.34314 1.5 7 2.84315 7 4.5V7M3.93939 18.5H16.0606C17.1317 18.5 18 17.6478 18 16.5967L16.7576 6.49997C16.7576 5.44879 15.8893 4.59663 14.8182 4.59663H4.93939C3.8683 4.59663 3 5.44879 3 6.49997L2 16.5967C2 17.6478 2.8683 18.5 3.93939 18.5Z"
          stroke={color}
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
        />
      </g>
    </svg>
  );
}
