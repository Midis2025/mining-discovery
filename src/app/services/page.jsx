import SubHeader from '@/components/sub-header'
import { SERVICES_SECTIONS } from '@/data'
import React from 'react'

export default function Services() {
  return (
    <main>
      <SubHeader title="Services" sections={SERVICES_SECTIONS} basePath="services" />
    </main>
  )
}
