import RevenueChart from "../../components/RevenueChart.jsx";
import SalesChart from "../../components/SalesChart.jsx";
import { gridData } from "../../constants/index.jsx";
import { HiOutlineArrowUp, HiOutlineArrowDown } from "react-icons/hi";
import FinancialBarChart from "../../components/FinancialBarChart.jsx";
import VisitorAnalyticsChart from "../../components/VisitorAnalyticsChart.jsx";

const GridStats = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Dynamically rendered grid items */}
      {gridData.map((item, index) => (
        <GridWrapper key={index}>
          <div className="relative">
            <div className="w-12 h-12 text-2xl flex items-center justify-between">
              {/* Render dynamic icons */}
              {item.userIcon || item.customersIcon || item.incomeIcon || item.connectIcon}
              <div className="px-10 text-xl flex items-center justify-between">
                {item.totalUsers || item.totalClients || item.totalIncome || item.totalConnect}
              </div>
            </div>
            <div className="pt-3 text-xl text-gray-700 font-light">
              {item.userLabel || item.customerLabel || item.incomeLabel || item.connectLabel}
            </div>
            <div className="absolute w-12 h-12 -top-7 -right-6">
              {item.signalIcon || item.customerGroupIcon || item.networthIcon || item.otherConnectIcon}
            </div>
          </div>
          <div className="relative">
            <p
              className={`flex gap-1 items-center text-base font-semibold 
              ${(item.userRate > 0 || item.customerRate > 0 || item.incomeRate > 0 || item.connectRate > 0) 
                  ? "text-emerald-500" : "text-red-500"} absolute -bottom-7 -right-7`}
            >
              {(item.userRate > 0 || item.customerRate > 0 || item.incomeRate > 0 || item.connectRate > 0)
                 ? <HiOutlineArrowUp /> : <HiOutlineArrowDown />}
              {item.userRate || item.customerRate || item.incomeRate || item.connectRate}%
            </p>
          </div>
        </GridWrapper>
      ))}

      {/* Sales Chart */}
      <GridWrapper className="sm:col-span-2 lg:col-span-2 h-[500px]">
        <SalesChart />
      </GridWrapper>

      {/* Revenue Chart */}
      <GridWrapper className="sm:col-span-2 lg:col-span-2 h-[500px] overflow-auto">
        <RevenueChart />
      </GridWrapper>

      {/* Double Region Charts with Responsive Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-[2fr_3fr] lg:grid-cols-[3fr_2fr] gap-4 lg:col-span-4">
        <GridWrapper className="h-[500px]">
          <FinancialBarChart />
        </GridWrapper>
        <GridWrapper className="h-[500px]">
          <VisitorAnalyticsChart />
        </GridWrapper>
      </div>
    </div>
  );
};

export default GridStats;

const GridWrapper = ({ children, className = "" }) => {
  return (
    <div className={`bg-white rounded-lg p-9 border-gray-200 items-center ${className}`}>
      {children}
    </div>
  );
};
