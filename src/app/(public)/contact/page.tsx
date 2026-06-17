"use client"; 

import {HeroSection } from '@/presentation/components/contact/HeroContact';
import FormContact from '@/presentation/components/contact/FormContact';
export default function Contact() {
    return (
        <div>
            <HeroSection />
            <div className="w-full px-8 xl:px-16">
                <div className="max-w-[1920px] mx-auto">
                    <FormContact />
                </div>
            </div>
        </div>
    );
}