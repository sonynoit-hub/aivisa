import { Fragment } from 'react';
export default function I18nProvider(props: { children: React.ReactNode }) {
  return <Fragment>{props.children}</Fragment>;
}
