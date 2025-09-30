import React from 'react'
import { Transaction } from '@/types'

const TransactionComponent = ({tx}: {tx:Transaction}) => {
    const formatData =new Date(tx.createdAt).toLocaleDateString("fr-FR", {
        day:"numeric",
        month:"short",
        year:"numeric",
    })

  return (
    <div>
        dev
    </div>
  )
}

export default TransactionComponent