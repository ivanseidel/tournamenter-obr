type Option<T extends string | number> = {
  value: T;
  label: string;
  visible?: boolean;
};

type ButtonGroupProps<T extends string | number> = {
  options: Array<Option<T>>;
  value: T;
  onChange(value: T): void;
  justified?: boolean;
};

export function ButtonGroup<T extends string | number>({
  options,
  value,
  onChange,
  justified = true,
}: ButtonGroupProps<T>) {
  return (
    <div className={justified ? 'btn-group btn-group-justified' : 'btn-group'}>
      {options
        .filter((option) => option.visible !== false)
        .map((option) => (
          <button
            type="button"
            key={String(option.value)}
            className={`btn btn-default ${value === option.value ? 'active' : ''}`}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </button>
        ))}
    </div>
  );
}
