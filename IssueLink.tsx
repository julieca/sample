import { priceTierToAmount } from '@/util/currency'
import { switchEnum } from '@/util/jsx'
import { getSlug } from '@/util/text'
import { IssueIntent, UnlockType, useIssueUnlock } from '@/util/unlock'
import { Issue } from '@magloft/universal-sdk-graphql'
import Link from 'next/link'
import { FunctionComponent, ReactNode } from 'react'
import { CurrencyFormat } from '../Format/CurrencyFormat'

export interface IssueLinkProps {
  issue: Issue
  children?: ReactNode
}

export const IssueLink: FunctionComponent<IssueLinkProps> = ({ issue, children }) => {
  const intent = useIssueUnlock(issue)

  const isRead = intent === IssueIntent.READ
  const isPreview = intent === IssueIntent.OPTIN && issue.entryArticleSlug

  function getIssueDetailUrl() {
    const urlParts: string[] = ['collections', issue.slug!]
    return `/${urlParts.join('/')}`
  }

  function getReadUrl() {
    const urlParts: string[] = ['collections', issue.slug!]
    if ([UnlockType.CLASSIFICATION, UnlockType.PAID, UnlockType.SUBSCRIBE].includes(issue.unlockType as UnlockType)) {
      urlParts.unshift('secure')
    }
    const slug = (issue.articles && issue.articles.length > 0 ? getSlug(issue.articles[0]) : issue.entryArticleSlug) ?? 'pdf'
    if ((isRead || isPreview) && slug) { urlParts.push(slug) }
    return `/${urlParts.join('/')}`
  }

  if (isRead) {
    return <Link href={getReadUrl()}><button className='btn'>Read</button></Link>
  } else if (isPreview) {
    return <Link href={getReadUrl()}><button className='btn'>Preview</button></Link>
  }
  return (
    <Link href={getIssueDetailUrl()}>
      {switchEnum(intent, {
        [IssueIntent.PENDING]: () => (
          children ?? <button className='btn'>...</button>
        ),
        [IssueIntent.PURCHASE]: () => (
          children ?? <button className='btn'><CurrencyFormat>{priceTierToAmount(issue.priceTier!)}</CurrencyFormat></button>
        ),
        [IssueIntent.SUBSCRIBE]: () => (
          children ?? <button className='btn'>Subscribe</button>
        ),
        [IssueIntent.OPTIN]: () => (
          children ?? <button className='btn'>View</button>
        )
      })}
    </Link>
  )

}
