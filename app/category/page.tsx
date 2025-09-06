"use client"
import React from 'react'
import Wrapper from '../components/Wrapper'

const page = () => {
  return (
    <Wrapper>
        <div>
          <div className='mb-4'>
            <button className='btn btn-primary rounded-sm'>
              Ajouter une categorie
            </button>
          </div>
        </div>
    </Wrapper>
  )
}

export default page