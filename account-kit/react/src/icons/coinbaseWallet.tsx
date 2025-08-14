export const CoinbaseWallet = ({
  className,
  ...props
}: React.JSX.IntrinsicAttributes & React.SVGProps<SVGSVGElement>) => (
  <div className={`w-[20px] h-[20px] ${className ?? ""}`}>
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <g clipPath="url(#clip0_167_563)">
        <path
          d="M9.99992 19.1666C15.0625 19.1666 19.1666 15.0626 19.1666 9.99998C19.1666 4.93737 15.0625 0.833313 9.99992 0.833313C4.93731 0.833313 0.833252 4.93737 0.833252 9.99998C0.833252 15.0626 4.93731 19.1666 9.99992 19.1666Z"
          fill="#0052FF"
        />
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M3.58325 9.99998C3.58325 13.5438 6.45608 16.4166 9.99992 16.4166C13.5438 16.4166 16.4166 13.5438 16.4166 9.99998C16.4166 6.45615 13.5438 3.58331 9.99992 3.58331C6.45608 3.58331 3.58325 6.45615 3.58325 9.99998ZM8.36011 7.93238C8.12385 7.93238 7.93232 8.12391 7.93232 8.36017V11.6398C7.93232 11.876 8.12385 12.0676 8.36011 12.0676H11.6397C11.876 12.0676 12.0675 11.876 12.0675 11.6398V8.36017C12.0675 8.12391 11.876 7.93238 11.6397 7.93238H8.36011Z"
          fill="white"
        />
      </g>
      <defs>
        <clipPath id="clip0_167_563">
          <rect
            width="18.3333"
            height="18.3333"
            fill="white"
            transform="translate(0.833252 0.833313)"
          />
        </clipPath>
      </defs>
    </svg>
  </div>
);
