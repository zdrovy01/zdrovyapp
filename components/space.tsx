interface SpaceProps {
  size?: number;
}

export default function Space({ size = 10 }: SpaceProps) {
  return <div style={{ height: size }} />;
}
