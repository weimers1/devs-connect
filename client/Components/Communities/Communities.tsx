import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { assets } from '../../assets/assets'
import Layout from '../Layout'
import Sidebar from "../Communities/Sidebar"
import CommunityExplore from "../Communities/CommunityExplore"


function Communities() {

  return (
    <> 

    <Layout>
      
<div className="grid grid-cols-1 lg:grid-cols-12 gap-5 max-w-7xl mx-auto pl-10 ">
  <div className="lg:col-start-2 lg:col-span-7">
    <CommunityExplore />
  </div>
  <div className="lg:col-span-4 pl-1 ">
    <Sidebar />
  </div>
</div>

</Layout>
  

      </>
  )
}


export default Communities;
