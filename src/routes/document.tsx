import { Link, createFileRoute } from '@tanstack/react-router'
import type { ReactNode } from "react";
import { buttonVariants } from "../components/ui/Button";

export const Route = createFileRoute('/document')({
  component: Document,
})

const team = [
  { name: 'Alve Svarén', mail: 'mejl@gmail.com' },
  { name: 'Tristan Harbander', mail: 'harbander.tristan@gmail.com' },
  { name: 'Leo Söderberg', mail: 'leoso@chalmers.se' },
  { name: 'Vilmer Hahne Lundqvist', mail: 'vilmerha@chalmers.se'},
  { name: 'Felix Andersson', mail: 'fluxlux@gmail.com'},
  { name: 'Markus Rynnerr', mail: 'akdj@gmail.com'}
];

function Document() {
  return (
    
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto flex max-w-5xl flex-col gap-4 px-6 py-10">

        <header className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold">Innovation Document</h1>
          <p className="max-w-2xl text-ink-subtle">TEK830 - Group 9</p>
        </header>

        <DemoButton></DemoButton>

        {/* Section 1 */}
        <Section title="About the team">
          <p className="text-lg font-bold">Contact</p>
          <div className='grid grid-cols-3 space-y-4'>
            {Object.entries(team).map(([index, member]) => (
              <div key={index} className="flex flex-col">
                <h3 className="text-xs font-bold text-ink-subtle">{member.name}</h3>
                <MailToLink>{member.mail}</MailToLink>
              </div>
            ))}
          </div>
        </Section>

        {/* Section 2 */}
        <Section title="Innovation Overview and Early Prototype">
          <p className="text-lg font-bold">Description</p>
          <p className="max-w-2xl text-ink-subtle">
            Our innovation and solution to problem 4.e “Deliver a fair and just transition across the value chain” in Germany is EYEKEA.
            The idea is a website displaying a map of all German IKEA stores/warehouses and their supply chain, showing the worker’s health and labour conditions of all locations.
          </p>

          <p className="text-lg font-bold">Initial sketch</p>
          <p className="max-w-2xl text-ink-subtle">
            The initial sketch of the EYEKEA Web UI.
          </p>
          <img 
            src="https://cdn.discordapp.com/attachments/1365745673734983720/1557468437565931632/ALKuztZMO5Ir9cTebMTE72qSyxdg2d_8He4NGNpujE4tanI25AqnmBpSGeGHUcmLUvZY6NSw5I2uQfs2XEDUJmiFyMRcB3o8IjTwUbU-QSWz4xDLBsfurByi-jGH2mDVj03JBDXj0Wg3KJvWEQ4lmIK9a2l_magkIxyHpd1FUVtv5Qs2048.png?backend=b2&ex=6ac7e903&is=6ac69783&hm=7845cf642912949401e0e5979a81864403398b8b10082524b6d5a8b17be00e4c&"
            style={{height:3*120, width:4*120}}
            alt="new"
          />

        </Section>

        {/* Section 3 */}
        <Section title="Design Thinking Perspective">
          <p className="text-lg font-bold">User Value (Usability)</p>
          <p className="max-w-2xl text-ink-subtle">
            Mainly aimed at the IKEA management who works with making sure everyone in their supply chain is healthy.
            It visualizes the supply chain and highlights troublesome areas, this way IKEA can focus their efforts where it is needed most.
          </p>

          <p className="text-lg font-bold">Technical Realization (Feasibility) </p>
          <p className="max-w-2xl text-ink-subtle">
            Could be developed using any framework that can visualize a graph, preferably over a map.
            We are currently building our application with React.
            We integrated MapLibre-gl to show the locations on the map of Germany.
            The data is extracted from a JSON file and for this course we have synthesized realistic data.
            To experiment with modern development tools we will use Claude Code in the development process of Eyekea.
          </p>

          <p className="text-lg font-bold">Business Alignment (Viability) </p>
          <p className="max-w-2xl text-ink-subtle">
            We have reviewed potential issues in IKEAs supply chain in Germany and came to the conclusion that it's more troublesome the further down the supply chain you go.
            By ensuring that suppliers also follow IKEAs vision and values, IKEA can strengthen their good image and appeal to the masses.
          </p>
        </Section>

        {/* Section 4 */}
        <Section title="Sustainable Software Requirements">
          <p className="max-w-2xl text-ink-subtle">
            Text
          </p>
          <img 
            src="https://www.suso.academy/wp-content/uploads/2022/05/susaf.png"
            style={{height:600, width:600}}
            alt="new"
          />
        </Section>

        {/* Section 5 */}
        <Section title="Research and Sources">
          
          <p className="text-lg font-bold">Documentation</p>

          <HyperLink link="https://react.dev/learn">React</HyperLink>

          <p className="text-lg font-bold">Articles</p>
          {/* Source 1 */}

          <Reference link="https://doi.org/10.64628/aaj.hus4w4sh3" reference="Surmeier A., Meyer I., & Maleka M. (2026, June 2)">
            Global supply chains keep workers poor: three case studies show how the cycle can be broken
          </Reference>

          {/* Source 2 */}

          <Reference link="https://www.workersrights.org/our-work/issues/unchecked-corporate-power/unjust-supply-chains/" reference="Worker Rights Consortium (n.d.).">
            Unjust supply chain
          </Reference>
          
          <Reference link="https://zenodo.org/records/7342575" reference="Betz S., Deuboc L., Penzenstadler B., Porras J., Chitchyan R.,\n Seyff N., Venters C. C., Brooks I. (2022, November 21)">SusAF Workbook 6.0</Reference>

          <p className="text-lg font-bold">Other</p>
          {/* Source 1 */}
          <HyperLink link="https://www.deutscher-nachhaltigkeitskodex.de/de/">Deutscher Nachhaltigets Kodex</HyperLink>
          
        </Section>

        {/* Footer */}
        <Section title="">
        <img 
            src="https://cdn.discordapp.com/attachments/1303837844619661312/1557706414187618414/0de9873c-e32c-4be2-a458-a1ed00434dad.png?ex=6ac8c6a5&is=6ac77525&hm=aa7ab045935ceef623ca93a6ec5c2416a50724ade02b8b3749443962bba4d599&"
            style={{height:259/4, width:960/4}}
            alt="new"
          />
        </Section>

      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="border-b border-line pb-2 text-xl font-bold">{title}</h2>
      {children}
    </section>
  );
}


function DemoButton() {
  return (
    <div className="flex h-full flex-col items-start justify-center">
      <Link to="/" className={buttonVariants({ size: "la", variant: "primary" })}>
        DEMO
      </Link>
    </div>
  );
}

function HyperLink({children, link}: {children: string, link: string} ) {
  return (
    <a href={link} target="_blank" rel="noopener" className="underline text-informative text-md font-bold">
      {children}
    </a>
  );
}

function Reference({children, link, reference}: {children: string, link: string, reference: string}) {
  return (
    <p>
      <h3>
        <HyperLink link={link}>{children}</HyperLink>
      </h3>
      <p className="max-w-2xl text-ink-subtle">
        {reference.split("\\n").flatMap(x => [<br/>,x]).slice(1)}
      </p>
    </p>
  );
}

function MailToLink({children}: {children: string}) {
  return(
    <HyperLink link={`mailto:${children}`}>
      {children}
    </HyperLink>
  );
}