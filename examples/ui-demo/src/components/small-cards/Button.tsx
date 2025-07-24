import React, {PropsWithChildren} from "react";

type ButtonBaseProps = {
    className?: string;
};

type ButtonAsButton = PropsWithChildren<
    ButtonBaseProps & {
    as?: "button";
} & React.ButtonHTMLAttributes<HTMLButtonElement>
>;

type ButtonAsAnchor = PropsWithChildren<
    ButtonBaseProps & {
    as: "a";
} & React.AnchorHTMLAttributes<HTMLAnchorElement>
>;

type ButtonProps = ButtonAsButton | ButtonAsAnchor;

export const Button = ({
                           children,
                           className = "",
                           as = "button",
                           ...rest
                       }: ButtonProps) => {
    const Component = as;

    return (
        <Component className={`akui-btn-auth akui-btn ${className}`} {...rest}>
            {children}
        </Component>
    );
};
