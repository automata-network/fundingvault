interface GlassButtonProps
  extends React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {}

export const GlassButton = (props: GlassButtonProps): React.ReactElement => {
  const { className, children, ...restProps } = props;
  return (
    <button
      className={`ata-glass-btn${className ? ` ${className}` : ""}`}
      {...restProps}
    >
      <span className="ata-glass-btn-content">{children}</span>
    </button>
  );
};
