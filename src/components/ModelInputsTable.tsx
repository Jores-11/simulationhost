interface ModelInputsTableProps {
    marketingSpendData: { month: string; value: number }[];
  }
  
  export default function ModelInputsTable({
    marketingSpendData,
  }: ModelInputsTableProps) {
    return (
      <div className="bg-white p-4 rounded-lg shadow-md">
        <h2 className="text-lg font-semibold text-gray-700 mb-4">Model Inputs</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-gray-600">
            <thead>
              <tr className="bg-gray-100">
                <th className="p-2 text-left">Marketing Spend</th>
                {marketingSpendData.map((data) => (
                  <th key={data.month} className="p-2 text-right">
                    {data.month}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-2">Marketing Spend - Last</td>
                {marketingSpendData.map((data, index) => (
                  <td key={index} className="p-2 text-right">
                    ${data.value.toLocaleString()}
                  </td>
                ))}
              </tr>
              <tr>
                <td className="p-2">Marketing Growth %</td>
                {marketingSpendData.map((_, index) => (
                  <td key={index} className="p-2 text-right">
                    10%
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  }