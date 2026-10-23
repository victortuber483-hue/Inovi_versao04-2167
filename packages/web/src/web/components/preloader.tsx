type Props = { progress: number };

export function Preloader({ progress }: Props) {
  const percent = Math.round(Math.min(1, progress) * 100);
  const done = percent >= 100;
  return (
    <output className={`preloader${done ? " is-done" : ""}`} aria-hidden={done}>
      <p className="preloader-label">PREPARANDO O UNIVERSO</p>
      <div className="preloader-track" aria-hidden="true">
        <i style={{ width: `${percent}%` }} />
      </div>
      <span className="preloader-percent">{percent}%</span>
    </output>
  );
}
