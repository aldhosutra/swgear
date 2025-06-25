/* eslint-disable import/no-named-as-default */
/* eslint-disable @typescript-eslint/no-require-imports */
/* eslint-disable no-undef */
/* eslint-disable perfectionist/sort-objects */
/* eslint-disable perfectionist/sort-object-types */
/* eslint-disable import/no-unresolved */
/* eslint-disable perfectionist/sort-imports */
import type {ReactNode} from 'react'
import clsx from 'clsx'
import Heading from '@theme/Heading'
import styles from './styles.module.css'

type FeatureItem = {
  title: string
  Svg: React.ComponentType<React.ComponentProps<'svg'>>
  description: ReactNode
}

const FeatureList: FeatureItem[] = [
  {
    title: 'All-in-one Swagger/OpenAPI Suite',
    Svg: require('@site/static/img/undraw_software-engineer_xv60.svg').default,
    description: (
      <>
        swgr is a complete toolkit for OpenAPI/Swagger development: automate validation, client generation,
        benchmarking, reporting, and quality improvement in your API workflow. Streamline your API lifecycle from design
        to deployment.
      </>
    ),
  },
  {
    title: 'Benchmark, Actionable Grading & CI/CD Integration',
    Svg: require('@site/static/img/undraw_metrics_5v8d.svg').default,
    description: (
      <>
        Benchmark entire endpoint with a single command, Enforce performance standards with customizable grading and
        thresholds, and Integrate with your CI/CD pipeline to catch regressions before they reach production.
      </>
    ),
  },
  {
    title: 'Extensible & Developer Friendly',
    Svg: require('@site/static/img/undraw_proud-coder_9prj.svg').default,
    description: (
      <>
        Extend swgr with plugins, custom reporting, and flexible output formats (console, CSV, HTML, JSON). Enjoy a
        modern CLI with progress bars, spinners, and clear, actionable output.
      </>
    ),
  },
]

function Feature({title, Svg, description}: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className="text--center">
        <Svg className={styles.featureSvg} role="img" />
      </div>
      <div className="text--center padding-horiz--md">
        <Heading as="h3">{title}</Heading>
        <p>{description}</p>
      </div>
    </div>
  )
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  )
}
