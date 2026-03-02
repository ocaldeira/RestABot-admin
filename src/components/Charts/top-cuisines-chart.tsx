"use client";

import { ApexOptions } from "apexcharts";
import React from "react";
import ReactApexChart from "react-apexcharts";

interface TopCuisinesChartProps {
    data: Array<{ cuisine: string; count: number }>;
}

export function TopCuisinesChart({ data }: TopCuisinesChartProps) {
    const series = [
        {
            name: "Restaurants",
            data: data.map((item) => item.count),
        },
    ];

    const options: ApexOptions = {
        chart: {
            type: "bar",
            height: 350,
            toolbar: {
                show: false,
            },
        },
        plotOptions: {
            bar: {
                horizontal: true,
                borderRadius: 4,
            },
        },
        dataLabels: {
            enabled: false,
        },
        xaxis: {
            categories: data.map((item) => item.cuisine),
        },
        colors: ["#3C50E0"],
        fill: {
            opacity: 1,
        },
        title: {
            text: "Top Cuisines",
            style: {
                fontSize: "18px",
                fontWeight: "bold",
                color: "#1C2434", // text-black
            },
        },
        grid: {
            strokeDashArray: 5,
            xaxis: {
                lines: {
                    show: true,
                },
            },
            yaxis: {
                lines: {
                    show: true,
                },
            },
        },
        tooltip: {
            theme: "light",
            y: {
                formatter: function (val) {
                    return val + " Restaurants";
                },
            },
        },
    };

    return (
        <div className="col-span-12 rounded-[10px] bg-white px-7.5 py-6 shadow-1 dark:bg-gray-dark dark:shadow-card xl:col-span-7">
            <div id="chartOne" className="-ml-5">
                <ReactApexChart
                    options={options}
                    series={series}
                    type="bar"
                    height={350}
                />
            </div>
        </div>
    );
}
