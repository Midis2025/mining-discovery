import SubHeader from '@/components/sub-header'
import { MAGAZINE_SECTIONS } from '@/data'
import React from 'react'

export default function Magazine() {
  return (
    <main>
      <SubHeader title="Magazine" sections={MAGAZINE_SECTIONS} basePath="magazine" />
    </main>
  )
}
