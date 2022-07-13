import { CostExplorerClient, GetCostAndUsageCommand } from '@aws-sdk/client-cost-explorer'

interface AwsCost {
  date: string,
  value: string
}

const client = new CostExplorerClient({ region: process.env.AWS_REGIONS })

export const lambdaHandler = async (): Promise<AwsCost[] | Error> => {

  const now = new Date()
  const endDay = new Date(now.getFullYear(), now.getMonth(), 1)
  const startDay = new Date(now.getFullYear(), now.getMonth() -12, 1)

  try {
    const response = await client.send(
      new GetCostAndUsageCommand({
        Metrics: ['UnblendedCost'],
        Granularity: 'MONTHLY',
        TimePeriod: {
          Start: startDay.toISOString().slice(0, 10),
          End: endDay.toISOString().slice(0, 10)
        }
      })
    )

    if (response.ResultsByTime !== undefined) {
      const costsPerMonth: AwsCost[] = response.ResultsByTime.map(val => {
        return {
          date: val.TimePeriod?.Start || '',
          value: parseFloat(val.Total?.UnblendedCost.Amount || '').toFixed(2)
        }
      })
      console.log(costsPerMonth)
      return costsPerMonth
    } else {
      console.log('Not costs returned by api')
      return [{ date: '', value: '' }]
    }

  } catch (err) {
    console.error(err)
    const error = err as Error
    throw Error(error.message as string)
  }
}