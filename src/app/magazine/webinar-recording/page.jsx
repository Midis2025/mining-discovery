import SubHeader from '@/components/sub-header'
import { MAGAZINE_SECTIONS } from '@/data'
import React from 'react'

export default function WebinarRecording() {
  return (
    <div>
      <SubHeader title="Magazine" sections={MAGAZINE_SECTIONS} basePath="magazine" />
    </div>
  )
}
