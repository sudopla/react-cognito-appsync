import React from 'react'
import styled from 'styled-components'

const Section = styled.section`
  margin: 3rem auto;
  text-align: center;
`
const H1 = styled.h1`
  font-size: 5rem;
`

const UserProfile = () => {
  return (
    <Section>
      <H1>Your User Profile</H1>
    </Section>
  )
}

export default UserProfile
